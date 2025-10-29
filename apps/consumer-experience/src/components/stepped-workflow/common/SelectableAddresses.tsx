'use client';
import {
  Address,
  LineOfBusiness,
} from '@xd/api-types/dist/generated-types/sor';
import { toSentenceCase } from '@xd/utils/dist';
import { countryCodeToName } from '@xd/xd-components/src/utils/Adresses';
import {
  IconType,
  Label,
  Address as AddressComponent,
} from '@zinnia/bloom/components';
import { useFormContext } from 'react-hook-form';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { FieldData } from '@/components/field-data/FieldData';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { lineOfBusinessUrlPath } from '@/utils/data';

import styles from './Selectable.module.css';

interface SelectableAddressesProps {
  activeAddresses: Address[];
  correlationId?: string;
  // TODO: what would the default be if this was somehow null or undefined?
  defaultSelectedAddressId?: string;
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
}

export const SelectableAddresses = ({
  activeAddresses,
  correlationId,
  defaultSelectedAddressId,
  lineOfBusiness,
  planCode,
  policyNumber,
}: SelectableAddressesProps) => {
  const form = useFormContext();

  return (
    <div className={styles.addresses}>
      {activeAddresses.length === 0 && (
        <div className={noDataStyles.noBankDetails}>
          {/* TODO: what should this icon be? */}
          <NoDataAvailable
            iconType={IconType.BANK}
            correlationId={correlationId}
          >
            <p className="typography-content-body">
              Looks like you haven't added any addresses yet.
            </p>
          </NoDataAvailable>
        </div>
      )}
      {activeAddresses?.length > 0 && (
        <div>
          <div
            id="active-addresses"
            role="radiogroup"
            aria-label="select address"
            className={styles.radioCardContainer}
          >
            {activeAddresses.map((address, index) => (
              <div
                key={`${index}-${address.addressId}`}
                className={styles.radioCard}
              >
                <label
                  id={`${index}-${address.addressId}`}
                  className={styles.radioCardInner}
                >
                  <FieldData
                    Label={
                      <Label labelFor={`${index}-${address.addressId}`}>
                        {toSentenceCase(address.addressType)}
                      </Label>
                    }
                  >
                    <AddressComponent
                      addrCountry={countryCodeToName(address.country)}
                      city={address.city}
                      state={address.state}
                      zipCode={address.zipCode}
                      addrLine1={address.addressLine1}
                      addrLine2={address.addressLine2}
                      addrLine3={address.addressLine3}
                      zipExt={address.zipCodeExtension}
                    />
                  </FieldData>
                  <input
                    {...form.register('addressId')}
                    style={{ position: 'absolute', opacity: 0 }}
                    value={address.addressId}
                    type="radio"
                    role="radio"
                    id={`${index}-${address.addressId}`}
                    defaultChecked={
                      defaultSelectedAddressId === address.addressId
                    }
                  />
                </label>
              </div>
            ))}
          </div>
          {/* {!!form.formState.errors.distributionType?.message?.length && (
            <AssistiveText
              text={form.formState.errors.distributionType?.message}
            />
          )} */}
        </div>
      )}
      <div className={`my-lg mb-none ${styles.disclaimer}`}>
        <p className="typography-content-body-sm">
          Want to send a check to another address? Go to{' '}
          <Link
            isInternal
            href={`/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/profile?addBank=true#addAddressSection`}
          >
            address details
          </Link>{' '}
          to add. If you're not seeing the address you want to mail to, give us
          a call at <CarrierPhoneNumber />.
        </p>
      </div>
    </div>
  );
};
