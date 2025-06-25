import { AddressObj, AddressFormFields } from './types';

export const formatAddressLines = (
  addressLines?: AddressObj[]
): Record<string, string> => {
  if (!addressLines) {
    return {};
  }

  const formattedAddressLines: Record<string, string> = {};

  addressLines.forEach((line, index) => {
    if (!line?.addressVal) {
      return;
    }

    formattedAddressLines[`addressLine${index + 1}`] = line.addressVal;
  });

  return formattedAddressLines;
};

export const generateChanges = (dirtyFields: AddressFormFields) => {
  return Object.entries(dirtyFields).flatMap(([key, value]) => {
    if (key === 'addresses' && Array.isArray(value)) {
      const formattedAddressLines = formatAddressLines(value);
      return Object.entries(formattedAddressLines).map(
        ([addressKey, addressValue]) => ({
          fieldName: addressKey,
          value: addressValue,
        })
      );
    } else {
      return {
        fieldName: key,
        value: value,
      };
    }
  });
};
