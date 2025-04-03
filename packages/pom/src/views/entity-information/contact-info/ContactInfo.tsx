import { Address, Label } from '@zinnia/bloom/components';
import { clsx } from 'clsx';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

import { default as styles } from './ContactInfo.module.css';
import { AddressType, PhoneNumberType, ProducerType } from '../../../types';
import { useQuery } from '@tanstack/react-query';
import { getProducer } from '../../../queries/producers';
import { useParams, useSearchParams } from 'react-router';
import { Error } from '../../../components/transaction-response-card/TransactionResponseCard';
import { generateMockProducer } from '../../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';

export const ContactInfo = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';

  const { data: queryData } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMockFromUrl ? generateMockProducer(id ?? '') : queryData;

  // If we're not mocking and there's no data returned by the query
  if (!isMockFromUrl && !data) {
    return <Error message={`Error finding producer with id ${id}`} />;
  }

  if (!data) {
    return <Error message={`Error finding producer with id ${id}`} />;
  }
  const { producerType, addresses, phoneNumbers, email } = data;
  // Eventually, when we come back to this, we will need to loop over all addresses
  // and have logic to determine the label
  // and filter by end date
  // (also can that live in utils?)

  const businessAddress = addresses.find(
    address => address.type === AddressType.BUSINESS
  );

  const residentialAddress = addresses.find(
    address => address.type === AddressType.RESIDENTIAL
  );

  const mailingAddress = addresses.find(
    address => address.type === AddressType.MAILING
  );

  const businessPhone = phoneNumbers?.find(
    phone => phone.type === PhoneNumberType.BUSINESS
  );

  const residentialPhone = phoneNumbers?.find(
    phone => phone.type === PhoneNumberType.RESIDENTIAL
  );

  const mobilePhone = phoneNumbers?.find(
    phone => phone.type === PhoneNumberType.CELLULAR
  );

  const faxPhone = phoneNumbers?.find(
    phone => phone.type === PhoneNumberType.FAX_NUMBER
  );

  return (
    <div className="card-section">
      <h2>Contact Info</h2>
      <div className={clsx(styles.cardSubSectionContent)}>
        <div>
          <Label>Business Address</Label>
          <Address
            addrCountry={businessAddress?.country}
            addrLine1={businessAddress?.line ?? DEFAULT_ERROR_STRING}
            city={businessAddress?.city}
            state={businessAddress?.state}
            zipCode={businessAddress?.zipCode}
          />
        </div>
        <div>
          <Label>Mailing address</Label>
          <Address
            addrCountry={mailingAddress?.country}
            addrLine1={mailingAddress?.line ?? DEFAULT_ERROR_STRING}
            city={mailingAddress?.city}
            state={mailingAddress?.state}
            zipCode={mailingAddress?.zipCode}
          />
        </div>
        {producerType === ProducerType.INDIVIDUAL && (
          <div>
            <Label>Residential address</Label>
            <Address
              addrCountry={residentialAddress?.country}
              addrLine1={residentialAddress?.line ?? DEFAULT_ERROR_STRING}
              city={residentialAddress?.city}
              state={residentialAddress?.state}
              zipCode={residentialAddress?.zipCode}
            />
          </div>
        )}
        <div>
          <Label>Business Phone</Label>
          <span>{businessPhone ? businessPhone.number : '--'}</span>
        </div>
        {producerType === ProducerType.INDIVIDUAL && (
          <div>
            <Label>Home Phone</Label>
            <span>{residentialPhone ? residentialPhone.number : '--'}</span>
          </div>
        )}
        <div>
          <Label>Mobile Phone</Label>
          <span>{mobilePhone ? mobilePhone.number : '--'}</span>
        </div>
        <div>
          <Label>Fax</Label>
          <span>{faxPhone ? faxPhone.number : '--'}</span>
        </div>
        <div>
          <Label>Email</Label>
          <span>{email ?? DEFAULT_ERROR_STRING}</span>
        </div>
      </div>
    </div>
  );
};
