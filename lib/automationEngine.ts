import prisma from './db';
import { queueEmailJob } from './sqs';

type AutomationEvent = {
  type: 'CONTACT_CREATED';
  orgId: string;
  contactId: string;
  listId?: string;
};

export async function triggerAutomationEvent(event: AutomationEvent) {
  try {
    // Find active automations listening for this event type
    const automations = await prisma.automation.findMany({
      where: {
        orgId: event.orgId,
        triggerType: event.type,
        status: 'active',
        // If limited by list, only match if event matches that list
        ...(event.listId ? {} : { triggerListId: null })
      }
    });

    for (const automation of automations) {
      // If the automation demands a specific list but doesn't match, skip.
      if (automation.triggerListId && event.listId && automation.triggerListId !== event.listId) {
        continue;
      }

      // Generate payload mimicking campaign dispatch pattern for consumption by existing lambda/processor.
      const payload = {
        type: 'AUTOMATED_SEND',
        automationId: automation.id,
        contactId: event.contactId,
        templateId: automation.actionTemplateId,
        orgId: event.orgId,
        timestamp: new Date().toISOString()
      };

      // Spool to existing AWS queue fabric
      await queueEmailJob(payload);

      // Increment total execution cycles
      await prisma.automation.update({
        where: { id: automation.id },
        data: { totalRuns: { increment: 1 } }
      });
      
      console.log(`[Automation] Dispatched sequence "${automation.name}" to SQS for Contact ${event.contactId}`);
    }

  } catch (error) {
    console.error('[AutomationEngine] Trigger Failure:', error);
  }
}
