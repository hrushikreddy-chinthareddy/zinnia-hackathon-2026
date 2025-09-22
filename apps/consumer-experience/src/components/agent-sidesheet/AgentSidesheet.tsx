'use client';
import { POM_Producer_Models_SearchProducersResult } from '@xd/api-types/dist/generated-types/pom';
import { Address, Button, Label, SideSheet } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import styles from './AgentSidesheet.module.css';
import { FieldData } from '../field-data/FieldData';
import { Email } from '../pii/Email';
import { PiiWrapper } from '../pii/PiiWrapper';

export const AgentSidesheet = ({
  agentData,
}: {
  agentData: POM_Producer_Models_SearchProducersResult;
}) => {
  if (!agentData) {
    return null;
  }

  return (
    <SideSheet
      header="Agent Information"
      trigger={
        <Button size="small" mode="link" style={{ display: 'inline-block' }}>
          {toTitleCase(agentData.firstName)} {toTitleCase(agentData.lastName)}
        </Button>
      }
    >
      <div className={styles.personalInfo}>
        <div>
          <h2 className="mb-lg">Name</h2>
          <p>
            {toTitleCase(agentData.firstName)} {toTitleCase(agentData.lastName)}
          </p>
        </div>
        {agentData.businessAddress && (
          <div>
            <h2 className="mb-lg">Address</h2>

            <FieldData Label={<Label>Office</Label>}>
              <Address
                addrCountry={agentData.businessAddress.country}
                addrLine1={toTitleCase(agentData.businessAddress.line)}
                addrLine2={toTitleCase(agentData.businessAddress.line2)}
                city={toTitleCase(agentData.businessAddress.city)}
                state={agentData.businessAddress.state}
                zipCode={agentData.businessAddress.zipCode}
              />
            </FieldData>
          </div>
        )}
        {agentData.businessPhone && (
          <div>
            <h2 className="mb-lg">Phone</h2>

            {/* TODO: Need to format this */}
            <FieldData Label={<Label>Work phone</Label>}>
              <PiiWrapper>
                {agentData.businessPhone.countryCode}-
                {agentData.businessPhone.number}
              </PiiWrapper>
            </FieldData>
          </div>
        )}

        {agentData.email && (
          <div>
            <h2 className="mb-lg">Email</h2>

            <FieldData Label={<Label>Work email</Label>}>
              <div>
                <p className="typography-content-body-sm">
                  <Email emailAddress={agentData.email} />
                </p>
              </div>
            </FieldData>
          </div>
        )}
      </div>
    </SideSheet>
  );
};
