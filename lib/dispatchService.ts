import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';

/**
 * Monolithic Execution Module for Dispatching Campaigns.
 * This is designed to be invoked either by a USER Click or a Background CRON Job!
 */
export async function executeCampaignDispatch(campaignId: string) {
  try {
    // 1. Gather holistic context without relying on user session (Perfect for CRON)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { template: true }
    });

    if (!campaign) throw new Error("Campaign identity void.");
    if (campaign.status === 'sent' || campaign.status === 'sending') {
       return { success: false, error: "Broadcast in-flight or completed already." };
    }

    if (!campaign?.template?.html) throw new Error("Execution context deficit: Template missing HTML.");

    // 2. Gather organization credentials & fallback email
    const orgId = campaign.orgId;
    const activeOrg = await prisma.organisation.findUnique({ where: { id: orgId } });
    
    if (!activeOrg?.sesAccessKey) {
      throw new Error("Credential Block: Organization AWS config needed.");
    }

    const awsConfig = {
      accessKeyId: activeOrg.sesAccessKey,
      secretAccessKey: activeOrg.sesSecretKey || '',
      region: activeOrg.awsRegion || 'us-east-1'
    };

    // Set system status to blocking lock so multiple crons don't fight over it!
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'sending' } });

    // 3. Fetch target audience dynamically based on segmentation keys
    let targets = [];
    
    if (campaign.targetListId) {
      // Extract restricted list membership
      targets = await prisma.contact.findMany({
        where: { 
          orgId: orgId, 
          status: 'active',
          listMemberships: {
            some: { listId: campaign.targetListId }
          }
        }
      });
    } else {
      // Universal Default (All Active)
      targets = await prisma.contact.findMany({
        where: { orgId: orgId, status: 'active' }
      });
    }

    if (targets.length === 0) {
      await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'draft' } });
      return { success: false, error: "Zero targeted recipients identified." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fromEmail = campaign.fromEmail || activeOrg.fromEmail || "noreply@platform.com";
    const subject = campaign.subject || "Broadcast Event";

    // IN-MEMORY BUFFERS
    const dbPayloads: Array<{ campaignId: string, contactId: string, sesMessageId: string, status: string }> = [];
    let successCount = 0;
    let failCount = 0;

    // 🚀 PARALLEL DISPATCH MATRIX
    const promiseMatrix = targets.map(async (contact) => {
      try {
        let html = campaign.template?.html || "";
        
        // A. Dynamic Merge Tags
        html = html.replace(/{{first_name}}/g, contact.firstName || 'Friend')
                   .replace(/{{email}}/g, contact.email);

        // B. Dynamic Link Interception Rewriter
        const hrefRegex = /href="(https?:\/\/[^"]+)"/gi;
        html = html.replace(hrefRegex, (match, originalUrl) => {
          if (originalUrl.includes('/api/track') || originalUrl.includes('/unsubscribe')) return match;
          const trackerUrl = `${baseUrl}/api/track/click?camp=${campaignId}&cont=${contact.id}&dest=${encodeURIComponent(originalUrl)}`;
          return `href="${trackerUrl}"`;
        });

        // C. Inject Open Pixel & Unsubscribe
        const pixel = `<img src="${baseUrl}/api/track/open/${campaignId}/${contact.id}" width="1" height="1" style="display:none!important;"/>`;
        const unsub = `<div style="margin-top:40px;text-align:center;font-size:12px;color:#666;"><hr/><a href="${baseUrl}/unsubscribe?cid=${contact.id}&camp=${campaignId}" style="color:#10b981;">Unsubscribe</a></div>`;
        
        const finalHtml = html.includes('</body>') 
          ? html.replace('</body>', `${unsub}${pixel}</body>`)
          : `${html}${unsub}${pixel}`;

        // D. Dispatch via AWS
        const resp = await sendEmail({
          to: contact.email,
          from: fromEmail,
          subject: subject,
          html: finalHtml,
          credentials: awsConfig
        });

        if (resp.success) {
          dbPayloads.push({
            campaignId: campaignId,
            contactId: contact.id,
            sesMessageId: resp.messageId || 'track',
            status: 'sent'
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        console.error(`Parallel Error [${contact.email}]:`, e);
        failCount++;
      }
    });

    // Wait for async burst
    await Promise.allSettled(promiseMatrix);

    // ATOMIC BATCH COMMIT
    if (dbPayloads.length > 0) {
      await prisma.campaignSend.createMany({
        data: dbPayloads,
        skipDuplicates: true
      });
    }

    // Final Status Release
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'sent' }
    });

    return {
      success: true,
      summary: {
        delivered: successCount,
        rejected: failCount
      }
    };

  } catch (err: any) {
    console.error("🔥 DISPATCH CRITICAL COLLAPSE:", err.message);
    // Reset to draft so user knows it failed and can try again
    try { await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'draft' } }); } catch(e){}
    throw err;
  }
}
