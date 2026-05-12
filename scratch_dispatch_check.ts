import prisma from './lib/db';
const TARGET_CAMP = "cmp1ndfwy0000l8fw72bsxx6f"; // Plucked from user logs

async function audit() {
  console.log("🕵️ DISPATCH PRE-FLIGHT AUDIT COMMENCING...");
  
  try {
    const camp = await prisma.campaign.findUnique({
      where: { id: TARGET_CAMP },
      include: { template: true, organisation: true }
    });

    if (!camp) {
      console.log("❌ AUDIT ERROR: Campaign ID not found in DB!");
      return;
    }

    console.log(`\n--- [ AUDIT RESULTS FOR ${TARGET_CAMP} ] ---`);
    
    const htmlPresent = !!camp.template?.html;
    console.log(`1. TEMPLATE HTML READY? -> ${htmlPresent ? "✅ YES" : "❌ NO - Missing HTML body!"}`);

    const sesKeyPresent = !!camp.organisation.sesAccessKey;
    const sesSecretPresent = !!camp.organisation.sesSecretKey;
    console.log(`2. AWS SES KEYS READY? -> ${sesKeyPresent && sesSecretPresent ? "✅ YES" : "❌ NO - Missing Access or Secret Key!"}`);

    const activeContacts = await prisma.contact.count({
      where: { orgId: camp.orgId, status: 'active' }
    });
    console.log(`3. TARGET AUDIENCE COUNT? -> ${activeContacts > 0 ? `✅ YES (${activeContacts} Contacts)` : "❌ NO - ZERO Active Contacts found!"}`);

    console.log("\n🏁 DIAGNOSTIC FINAL: Check failed conditions above!");

  } catch (e: any) {
    console.error("CRASH:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
