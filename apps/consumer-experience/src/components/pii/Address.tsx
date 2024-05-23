import { ReactNode } from 'react';

import { PiiProps } from '@/types/pii';

import { PiiWrapper } from './PiiWrapper';

interface AddressProps extends PiiProps {
  addrLine1: ReactNode;
  addrLine2?: ReactNode;
  addrLine3?: ReactNode;
  city: ReactNode;
  state: ReactNode;
  zipCode: ReactNode;
  zipExt?: ReactNode;
  addrCountry: ReactNode;
}

export const Address = (address: AddressProps) => {
  return (
    <div className="typography-content-body-sm">
      <p>
        <PiiWrapper>{address.addrLine1}</PiiWrapper>
      </p>
      {address.addrLine2 && (
        <p>
          <PiiWrapper>{address.addrLine2}</PiiWrapper>
        </p>
      )}
      {address.addrLine3 && (
        <p>
          <PiiWrapper>{address.addrLine3}</PiiWrapper>
        </p>
      )}
      <p>
        <PiiWrapper>{address.city}</PiiWrapper>
        {address.city && address.state && <span>, </span>}
        <PiiWrapper>{address.state}</PiiWrapper>{' '}
        <PiiWrapper>{address.zipCode}</PiiWrapper>
        {address.zipExt && <PiiWrapper>{`-${address.zipExt}`}</PiiWrapper>}
      </p>
      <p>
        <PiiWrapper>{address.addrCountry}</PiiWrapper>
      </p>
    </div>
  );
};
