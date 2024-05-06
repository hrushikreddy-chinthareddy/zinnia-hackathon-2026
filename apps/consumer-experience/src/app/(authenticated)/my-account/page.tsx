import { Label } from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { getSession } from '@/utils/auth';
import { checkIfNull } from '@/utils/data';

export default async function MyAccount() {
  const session = await getSession();

  return (
    <div className="container">
      <HeaderBreadcrumb title="Account" preventGoBack />
      <p className="typography-content-body-sm">
        Your carrier relies on Zinnia Tech to manage your policies. This enables
        you to conveniently access all your policies, even those with other
        carriers integrated into Zinnia's system, from one centralized platform.
      </p>
      <div style={{ display: 'flex', gap: 'var(--measure-dimension-gap-xl)' }}>
        <FieldData Label={<Label>Your Zinnia Tech sign in email</Label>}>
          <p className="typography-content-body-sm">
            {checkIfNull(session?.user.email)}
          </p>
        </FieldData>
        {/* // TODO: still need to figure out how to get this value from auth0 */}
        {/* <FieldData Label={<Label>Your Zinnia Tech sign in phone number</Label>}>
          <p className="typography-content-body-sm">PHONE NUMBER</p>
        </FieldData> */}
      </div>
      <Footer />
    </div>
  );
}
