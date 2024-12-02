import { TranslationFiles } from "@deps/config/translations";
import { useTranslation } from "react-i18next";


function AddressTab({ Address }: { Address: any }) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.CaseDetailsContent.addressHistoryTab' });
  return (
    <div className="flex-1 flex flex-col w-full !mb-0 px-4 pt-5 md:px-6 lg:px-8 gap-4">
      {Address.map((address: any) => {
        return (
          <div key={address.addressId} className="px-4 mt-3">
            <div className="flex gap-2  items-center">
              <div className="font-medium">
                {address.addressType === 'DEFAULT' && t('defaultAddress')}
                {address.addressType === 'RESIDENCE' && t('residentialAddress')}
                {address.addressType === 'MAILING' && t('mailingAddress')}

              </div>
              {address.preferredAddress && <div className=" bg-green-600 inline-block h-2 w-2 rounded-full"></div>}
            </div>
            <div className="text-md">
              {address.city}, {address.state}-{address.zipCode}
            </div>
          </div>

        )
      })}
    </div>
  )
}

export default AddressTab