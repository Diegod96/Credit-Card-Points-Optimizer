import { auth } from '@/lib/auth';
import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: session.user.id },
    client_name: 'CardStack',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });

  return Response.json({ link_token: response.data.link_token });
}
