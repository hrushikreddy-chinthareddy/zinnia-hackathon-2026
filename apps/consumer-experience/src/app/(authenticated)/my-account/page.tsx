import { Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderLink } from '@/components/header-link/HeaderLink';
import { Email } from '@/components/pii/Email';
import { getSession } from '@/utils/auth';
import { checkIfNull } from '@/utils/data';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'My Account',
};

export default async function MyAccount() {
  const session = await getSession();

  return (
    <div className="container">
      <HeaderLink title="Account" />
      <p className="typography-content-body-sm">
        Use your policy portal account to conveniently manage all your policies.
      </p>
      <div style={{ display: 'flex', gap: 'var(--measure-dimension-gap-xl)' }}>
        <FieldData Label={<Label>Your sign-in email</Label>}>
          <Email emailAddress={checkIfNull(session?.user?.email)} />
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
