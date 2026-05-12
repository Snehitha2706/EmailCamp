require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Re-starting Master Seed with exact Schema Alignment...");

  // 1. Create Primary Organization
  const org = await prisma.organisation.create({
    data: {
      name: "Venture Operations HQ",
    }
  });
  console.log(`✔ Created Organisation: ${org.id}`);

  // 2. Create User (email, passwordHash, role, orgId)
  const user = await prisma.user.create({
    data: {
      email: `admin_${Math.floor(Math.random() * 1000)}@ventureops.hq`,
      passwordHash: "sechash_123",
      role: "admin",
      orgId: org.id,
    }
  });
  console.log(`✔ Created User node: ${user.id}`);

  // 3. Seed Sample Contacts (firstName, lastName, email, status, customFields, orgId)
  const rawContacts = [
    { f: "Alex", l: "Rivera", e: "alex@riv.tech" },
    { f: "Sarah", l: "Jenkins", e: "sarah.j@quantum.org" },
    { f: "Michael", l: "Chen", e: "chen@asia.biz" },
    { f: "Emma", l: "Watson", e: "em.watson@domain.co" },
  ];

  let contactIds = [];

  console.log("🌱 Injecting standardized Contact grid...");
  for (const rc of rawContacts) {
    const c = await prisma.contact.create({
      data: {
        firstName: rc.f,
        lastName: rc.l,
        email: rc.e,
        status: "active",
        customFields: { company: "Simulated Corp" },
        orgId: org.id,
      }
    });
    contactIds.push(c.id);
  }

  // 4. Create List
  const list = await prisma.contactList.create({
    data: {
      name: "Core Product Leads",
      description: "Initial outreach pool.",
      orgId: org.id,
    }
  });
  console.log(`✔ Created List wrapper: ${list.id}`);

  // 5. Generate Campaign
  const camp = await prisma.campaign.create({
    data: {
      name: "Q2 Platform Welcome",
      subject: "Welcome to the next-gen platform.",
      status: "sent",
      orgId: org.id,
    }
  });
  console.log(`✔ Created Campaign record: ${camp.id}`);

  // 6. Generate Engagement Telemetry (Events)
  console.log("🌱 Broadcasting simulated analytical events...");
  await prisma.emailEvent.createMany({
    data: [
      { contactId: contactIds[0], campaignId: camp.id, eventType: "sent" },
      { contactId: contactIds[0], campaignId: camp.id, eventType: "delivered" },
      { contactId: contactIds[0], campaignId: camp.id, eventType: "opened" },
      { contactId: contactIds[1], campaignId: camp.id, eventType: "sent" },
      { contactId: contactIds[1], campaignId: camp.id, eventType: "delivered" },
      { contactId: contactIds[2], campaignId: camp.id, eventType: "bounced" },
    ]
  });

  console.log("🔥 COMPLETE! THE DATABASE HAS BEEN ACTIVATED SUCCESSFULLY.");
}

main()
  .catch((e) => {
    console.error("❌ SEED EXECUTION FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
