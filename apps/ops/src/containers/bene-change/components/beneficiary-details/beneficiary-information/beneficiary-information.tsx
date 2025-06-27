import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { Carrier } from '@deps/models/case/withdrawal/case';

interface BeneficiaryInformationProps {
    carrierId: string;
    updateInfo: any;
    setBeneInfo: Dispatch<SetStateAction<any>>;
    isReadOnly?: boolean;
}

const INITIAL_BENE_INFO = {
    isPerStirpes: false,
    isIrrevocable: false,
    isRestrictedBeneficiary: false,
};

export default function BeneficiaryInformation({
    carrierId,
    setBeneInfo,
    updateInfo,
    isReadOnly,
}: BeneficiaryInformationProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.beneInformation',
    });

    const options = {
        isRequired: false,
        selectOptions: [
            { label: t('yes'), value: 'true' },
            { label: t('no'), value: 'false' },
        ],
    };
    const [bene, setBene] = useState(updateInfo ?? INITIAL_BENE_INFO);

    const toggleSelection = (option: string, value: string) => {
        if (option === 'isPerStirpes') {
            setBene((prevState: any) => ({
                ...prevState,
                isPerStirpes: value === 'true',
            }));
        }
        if (option === 'isIrrevocable') {
            setBene((prevState: any) => ({
                ...prevState,
                isIrrevocable: value === 'true',
            }));
        }
        if (option === 'isRestrictedBeneficiary') {
            setBene((prevState: any) => ({
                ...prevState,
                isRestrictedBeneficiary: value === 'true',
            }));
        }
    };

    useEffect(() => {
        setBeneInfo((prevState: any) => ({ ...prevState, ...bene }));
    }, [bene, setBeneInfo]);

    return (
        <>
            <div className="mb-4">
                <Radio
                    items={options.selectOptions}
                    label={t('perStirpes') as string}
                    onChange={(event) =>
                        toggleSelection('isPerStirpes', event.target.value)
                    }
                    value={bene.isPerStirpes ? 'true' : 'false'}
                    variant={
                        isReadOnly
                            ? RadioVariant.Inactive
                            : RadioVariant.Default
                    }
                    disabled={isReadOnly}
                    name={'perStripes' + Math.random()}
                />
            </div>

            <div className="mb-4">
                <Radio
                    items={options.selectOptions}
                    label={t('irrevocable') as string}
                    onChange={(event) =>
                        toggleSelection('isIrrevocable', event.target.value)
                    }
                    value={bene.isIrrevocable ? 'true' : 'false'}
                    variant={
                        isReadOnly
                            ? RadioVariant.Inactive
                            : RadioVariant.Default
                    }
                    disabled={isReadOnly}
                    name={'irrevocable' + Math.random()}
                />
            </div>

            {carrierId === Carrier.MASS && (
                <div className="mb-4">
                    <Radio
                        items={options.selectOptions}
                        label={t('restrictedBeneficiaryDesignation') as string}
                        onChange={(event) =>
                            toggleSelection(
                                'isRestrictedBeneficiary',
                                event.target.value
                            )
                        }
                        value={bene.isRestrictedBeneficiary ? 'true' : 'false'}
                        variant={
                            isReadOnly
                                ? RadioVariant.Inactive
                                : RadioVariant.Default
                        }
                        disabled={isReadOnly}
                        name={
                            'restrictedBeneficiaryDesignation' + Math.random()
                        }
                    />
                </div>
            )}
        </>
    );
}
