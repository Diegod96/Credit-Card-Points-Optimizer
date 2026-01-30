import { NextRequest } from 'next/server';
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhook_type, webhook_code, item_id } = body;

    if (webhook_type === 'TRANSACTIONS') {
      const linkedAccount = await prisma.linkedAccount.findFirst({
        where: { plaidItemId: item_id },
      });

      if (!linkedAccount) {
        console.warn('Webhook received for unknown item:', item_id);
        return new Response('OK', { status: 200 });
      }

      if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
        await inngest.send({
          name: 'plaid/transactions.sync',
          data: {
            linkedAccountId: linkedAccount.id,
          },
        });
      } else if (webhook_code === 'ERROR') {
        await prisma.linkedAccount.update({
          where: { id: linkedAccount.id },
          data: {
            status: 'error',
            errorCode: body.error?.error_code || 'UNKNOWN',
          },
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('OK', { status: 200 });
  }
}
