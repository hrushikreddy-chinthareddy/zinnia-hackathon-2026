import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const BASE_KEY = 'policy.detailCards.additionalInformation';

interface AdditionalInformationCardProps {
    policyDetails: PolicyDetails;
}

const AdditionalInformationCard = ({ policyDetails }: AdditionalInformationCardProps) => {
    const { t } = useTranslation();
    const currency = policyDetails?.currency;
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const netAmountRiskValue = numberFormatify(policyDetails?.netAmountAtRisk, currencyFormat);

    return (
        <CardContainer containerClassNames="rounded-b">
            <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}.additionalInformation`)}</Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                {!policyDetails.isAnnuity && (
                    <div>
                        <div className="flex items-center gap-2">
                            <Label label={t(`${BASE_KEY}.netAmountRisk`)} variant={LabelVariant.FieldLabel} />
                            <Popover
                                popoverClassName="font-secondary text-md font-normal leading-[22px]"
                                title={t(`${BASE_KEY}.netAmountRisk`) as string}
                                body={t(`${BASE_KEY}.netAmountRiskPopover`) as string}
                                placement={PopoverPlacement.TopRight}
                            >
                                <span className="relative bottom-[0.5px] block">
                                    <CircleInfoIcon height="16px" width="16px" className="text-primary" />
                                </span>
                            </Popover>
                        </div>
                        <Content details={netAmountRiskValue} variant={ContentVariant.BodySm} />
                    </div>
                )}
                <div>
                    <Label label={t(`${BASE_KEY}.planCode`)} variant={LabelVariant.FieldLabel} />
                    <Content details={policyDetails?.planCode ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
            </div>
        </CardContainer>
    );
};

export default AdditionalInformationCard;
