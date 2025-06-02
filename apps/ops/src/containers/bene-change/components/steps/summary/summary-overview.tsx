import { PartyRole } from '@zinnia/api-types/types/sor';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import { toTitleCase } from '@deps/helpers/string.helpers';

import { getTagVariant } from './summary-step.helpers';

const BeneficiaryOverview = ({ name, action, allocation }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.summary' });
    const { tagVariant, tagText } = getTagVariant(action, t);
    const allocationValue = action === 'DELETE' ? '--' : `${allocation}%`;

    return (
        <div className="mr-5 flex">
            <div className="flex w-full flex-row p-4">
                <Typography className="basis-1/2" variant={TypographyVariant.BodySm}>
                    {name}
                </Typography>
                <div className="basis-1/4">
                    <Tag text={tagText} className="mx-2 h-6 " variant={tagVariant as TagVariant} />
                </div>
                <div className="flex basis-1/4 justify-end">{allocationValue}</div>
            </div>
        </div>
    );
};

const SummaryOverview = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.summary' });
    const { beneData } = useBeneChange();

    const primaryBeneficiary = beneData?.filter((item: any) => item.partyRole.partyRole === PartyRole.PRIMARYBENEFICIARY);
    const contingentBeneficiary = beneData?.filter((item: any) => item.partyRole.partyRole === PartyRole.CONTINGENTBENEFICIARY);

    return (
        <div>
            <Typography variant={TypographyVariant.H3} className="my-3">
                {t('overview')}
            </Typography>

            <div className="grid grid-cols-2">
                <div>
                    <Label className=" h-6" label={t('primaryBeneficiary')} variant={LabelVariant.LabelLg} />
                    {primaryBeneficiary?.map((item: any) => {
                        const { firstName, middleName, lastName } = item?.party?.info ?? {};
                        const allocation = item?.party?.allocation?.beneficiaryPercentage ?? 0;
                        return (
                            <div key={`bene-overview-${item.index}`}>
                                <BeneficiaryOverview
                                    name={toTitleCase([firstName, middleName, lastName].filter(Boolean).join(' '))}
                                    action={item?.action}
                                    allocation={allocation}
                                />
                                <div className="w-[500px] border border-b-1 border-gray-100"></div>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <Label className="h-6" label={t('contingentBeneficiary')} variant={LabelVariant.LabelLg} />
                    {contingentBeneficiary?.map((item: any) => {
                        const { firstName, middleName, lastName } = item?.party?.info ?? {};
                        const allocation = item?.party?.allocation?.beneficiaryPercentage ?? 0;
                        return (
                            <div key={`bene-overview-${item.index}`}>
                                <BeneficiaryOverview
                                    name={toTitleCase([firstName, middleName, lastName].filter(Boolean).join(' '))}
                                    action={item?.action}
                                    allocation={allocation}
                                />
                                <div className="w-[500px] border border-b-1 border-gray-100"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SummaryOverview;
