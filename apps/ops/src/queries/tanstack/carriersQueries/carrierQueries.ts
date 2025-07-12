import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

export const getCarrierTranslations = async (carrierId?: string) => {
    if (!carrierId) {
        throw 'No carrier id provided';
    }
    // const response = await client.get<any, AxiosResponse>(`${baseAppUrl}/api/v1/carriers/${carrierId}/translations`);

    const response = {
        status: StatusCode.Okay,
        statusText: 'OK',
        data: {
            carrierId: 'FNWL',
            categories: [
                {
                    categoryName: 'RISKCLASS',
                    translations: [
                        {
                            sorValue: 'STANDARDNONTOBACCO',
                            carrierValue: 'Platinum',
                            metadata: {
                                tobaccoUse: 'No',
                            },
                        },
                        {
                            sorValue: 'STANDARDPLUSNONTOBACCO',
                            carrierValue: 'Platinum Choice',
                            metadata: {
                                tobaccoUse: 'Yes',
                            },
                        },
                        {
                            sorValue: 'PREFERREDNONTOBACCO',
                            carrierValue: 'Platinum Plus',
                        },
                        {
                            sorValue: 'ELITENONTOBACCO',
                            carrierValue: 'Platinum Elite',
                        },
                        {
                            sorValue: 'STANDARDTOBACCO',
                            carrierValue: 'Gold',
                        },
                        {
                            sorValue: 'PREFERREDTOBACCO',
                            carrierValue: 'Gold Plus',
                        },
                        {
                            sorValue: 'STANDARDCONVERSIONNONTOBACCO',
                            carrierValue: 'Platinum Substandard',
                        },
                        {
                            sorValue: 'STANDARDCONVERSIONTOBACCO',
                            carrierValue: 'Gold Substandard',
                        },
                    ],
                },
                {
                    categoryName: 'TABLERATING',
                    translations: [
                        {
                            sorValue: 'TABLEA',
                            carrierValue: 'A',
                        },
                        {
                            sorValue: 'Table B',
                            carrierValue: 'B',
                        },
                    ],
                },
            ],
        },
    };

    if (response.status === StatusCode.Okay) {
        const riskClasses = response.data.categories.find(
            (category) => category.categoryName === 'RISKCLASS'
        );

        return riskClasses?.translations || [];
    }

    throw `Error getting carrier translations ${carrierId}: ${response.status} ${response.statusText}`;
};
