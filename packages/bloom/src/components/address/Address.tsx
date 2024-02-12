export type AddressProps = {
  addrLine1: string;
  addrLine2?: string;
  addrLine3?: string;
  city: string;
  state: string;
  zipCode: string;
  zipExt?: string;
  addrCountry: string;
};

export const Address = (address: AddressProps) => {
  return (
    <div className="typography-content-body-sm">
      <p>{address.addrLine1}</p>
      {address.addrLine3 && <p>{address.addrLine2}</p>}
      {address.addrLine3 && <p>{address.addrLine3}</p>}
      <p>
        <span>{address.city}</span>
        {address.city && address.state && <span>, </span>}
        <span>{address.state}</span> <span>{address.zipCode}</span>
        {address.zipExt && <span>{`-${address.zipExt}`}</span>}
      </p>
      <p>{address.addrCountry}</p>
    </div>
  );
};
