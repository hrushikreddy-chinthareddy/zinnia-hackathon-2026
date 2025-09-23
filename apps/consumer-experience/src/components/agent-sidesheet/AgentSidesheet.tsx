'use client';
import { Address, Button, Label, SideSheet } from '@zinnia/bloom/components';
import { formatPhoneNumber, toTitleCase } from '@zinnia/utils';

import { FilteredPomAgentData } from '@/services/pom/distributors/v1/producers/search/transformers';

import styles from './AgentSidesheet.module.css';
import { FieldData } from '../field-data/FieldData';
import { Email } from '../pii/Email';
import { PiiWrapper } from '../pii/PiiWrapper';

export const AgentSidesheet = ({
  agentData,
}: {
  agentData: FilteredPomAgentData;
}) => {
  if (!agentData) {
    return null;
  }

  const { firstName, lastName, businessPhone, email, businessAddress } =
    agentData;

  return (
    <SideSheet
      header="Agent Information"
      trigger={
        <Button size="small" mode="link" style={{ display: 'inline-block' }}>
          {toTitleCase(firstName)} {toTitleCase(lastName)}
        </Button>
      }
    >
      <div className={styles.personalInfo}>
        <div>
          <h2 className="mb-lg">Name</h2>
          <p>
            {toTitleCase(firstName)} {toTitleCase(lastName)}
          </p>
        </div>
        {businessAddress && (
          <div>
            <h2 className="mb-lg">Address</h2>

            <FieldData Label={<Label>Office</Label>}>
              <Address
                addrCountry={businessAddress.country}
                addrLine1={toTitleCase(businessAddress.line)}
                addrLine2={toTitleCase(businessAddress.line2)}
                city={toTitleCase(businessAddress.city)}
                state={businessAddress.state}
                zipCode={businessAddress.zipCode}
              />
            </FieldData>
          </div>
        )}
        {businessPhone && (
          <div>
            <h2 className="mb-lg">Phone</h2>

            <FieldData Label={<Label>Work phone</Label>}>
              <PiiWrapper>
                {formatPhoneNumber(
                  businessPhone.countryCode + businessPhone.number
                )}
              </PiiWrapper>
            </FieldData>
          </div>
        )}

        {email && (
          <div>
            <h2 className="mb-lg">Email</h2>

            <FieldData Label={<Label>Work email</Label>}>
              <div>
                <p className="typography-content-body-sm">
                  <Email emailAddress={email} />
                </p>
              </div>
            </FieldData>
          </div>
        )}
      </div>
    </SideSheet>
  );
};
