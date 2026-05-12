import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthOrg } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const org = await getAuthOrg();
    const { contacts, listId } = await request.json();

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: "Empty payload detected." }, { status: 400 });
    }

    // Use thread-safe trackers for mapped parallel accumulation
    let success = 0;
    let skipped = 0;

    // 🚀 CONVERTING SEQUENTIAL BLOCK TO MASSIVE PARALLEL PROMISE MATRIX
    const processBatch = contacts.map(async (raw) => {
      try {
        // Sanitize fast in local RAM
        const email = (raw.email || raw.Email || raw['E-mail'] || "").toString().trim().toLowerCase();
        
        if (!email || !email.includes('@')) {
          skipped++;
          return;
        }

        const firstName = (raw.firstName || raw['First Name'] || raw.firstname || "").toString().trim();
        const lastName = (raw.lastName || raw['Last Name'] || raw.lastname || "").toString().trim();

        // Trigger asynchronous promise thread
        const contact = await prisma.contact.upsert({
          where: {
            orgId_email: {
              orgId: org.id,
              email: email,
            },
          },
          update: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          },
          create: {
            orgId: org.id,
            email: email,
            firstName: firstName || null,
            lastName: lastName || null,
            status: 'active',
            source: 'import'
          }
        });

        // If targeted for specific list insertion, materialize link table relation
        if (listId) {
          await prisma.contactListMember.upsert({
            where: {
              contactId_listId: {
                contactId: contact.id,
                listId: listId
              }
            },
            create: {
              contactId: contact.id,
              listId: listId
            },
            update: {} // Do nothing if already exists
          });
        }

        success++;

      } catch (err) {
        console.error(`Ingestion Skip [Row]:`, err);
        skipped++;
      }
    });

    // 🔥 RUN ALL PARSED ROWS THROUGH PARALLEL SUPABASE POOL CONNECTIONS SIMULTANEOUSLY
    await Promise.allSettled(processBatch);

    return NextResponse.json({ 
      success: true, 
      message: `Optimization Active: Aggregated processing complete.`,
      count: success,
      skipped: skipped
    });

  } catch (error) {
    console.error("BULK PIPE FAULT:", error);
    return NextResponse.json({ error: "Synchronous failure" }, { status: 500 });
  }
}
