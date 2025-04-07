'use client';
import { Phone, Email as SOREmail } from '@zinnia/api-types/types/sor';
import { Address, Button, Label, SideSheet } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import { ModifiedAgentData } from '@/types/agent';

import styles from './AgentSidesheet.module.css';
import { FieldData } from '../field-data/FieldData';
import { Email } from '../pii/Email';
import { PhoneNumber } from '../pii/PhoneNumber';

export const AgentSidesheet = ({
  agentData,
}: {
  agentData: ModifiedAgentData;
}) => {
  if (!agentData) {
    return null;
  }

  return (
    <SideSheet
      header="Agent Information"
      trigger={
        <Button size="small" mode="link" style={{ display: 'inline-block' }}>
          {toTitleCase(agentData.fullName)}
        </Button>
      }
    >
      <div className={styles.personalInfo}>
        <div>
          <h2 className="mb-lg">Name</h2>
          <p>{toTitleCase(agentData.fullName)}</p>
        </div>
        {agentData.addresses && agentData.addresses.length > 0 && (
          <div>
            <h2 className="mb-lg">Address</h2>
            {agentData.addresses.map((address, index) => (
              <FieldData key={`key-${index}`} Label={<Label>Office</Label>}>
                <Address
                  addrCountry={address.country}
                  addrLine1={toTitleCase(address.addressLine1)}
                  addrLine2={toTitleCase(address.addressLine2)}
                  addrLine3={toTitleCase(address.addressLine3)}
                  city={toTitleCase(address.city)}
                  state={address.stateCode}
                  zipCode={address.zip}
                />
              </FieldData>
            ))}
          </div>
        )}
        {agentData.phones && agentData.phones.length > 0 && (
          <div>
            <h2 className="mb-lg">Phone</h2>
            {agentData.phones.map((phone, index) => (
              <FieldData
                Label={<Label>Work phone</Label>}
                key={`phone-key-${index}`}
              >
                <PhoneNumber phoneNumber={phone as Partial<Phone>} />
              </FieldData>
            ))}
          </div>
        )}

        {agentData.emails && agentData.emails.length > 0 && (
          <div>
            <h2 className="mb-lg">Email</h2>
            {agentData.emails.map((email, index) => (
              <FieldData
                Label={<Label>Work email</Label>}
                key={`email-key-${index}`}
              >
                <div>
                  <p className="typography-content-body-sm">
                    <Email
                      emailAddress={(
                        email as SOREmail
                      ).emailAddress?.toLowerCase()}
                    />
                  </p>
                </div>
              </FieldData>
            ))}
          </div>
        )}
      </div>
    </SideSheet>
  );
};
