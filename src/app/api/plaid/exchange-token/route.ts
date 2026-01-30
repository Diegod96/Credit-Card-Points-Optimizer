import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { plaidClient } from '@/lib/plaid';
import { CountryCode } from 'plaid';
import { inngest } from '@/inngest/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { public_token } = await request.json();

  if (!public_token) {
    return Response.json(
      { error: 'Missing public_token' },
      { status: 400 }
    );
  }

  try {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id!;

    const instResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });

    const linkedAccount = await prisma.linkedAccount.create({
      data: {
        userId: session.user.id,
        plaidItemId: item_id,
        plaidAccessToken: access_token,
        institutionId,
        institutionName: instResponse.data.institution.name,
        status: 'active',
      },
    });

    await inngest.send({
      name: 'plaid/transactions.sync',
      data: {
        linkedAccountId: linkedAccount.id,
      },
    });

    return Response.json({ success: true, accountId: linkedAccount.id });
  } catch (error) {
    console.error('Token exchange failed:', error);
    return Response.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
