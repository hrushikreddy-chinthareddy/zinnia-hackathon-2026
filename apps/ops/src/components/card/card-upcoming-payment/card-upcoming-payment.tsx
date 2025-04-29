import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import CardSection from '@deps/components/card/card-section/card-section';
import CardTransactions from '@deps/components/card/card-transactions/card-transactions';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PopoverPlacement } from '@deps/components/popover/popover';
import ResponsiveFlex from '@deps/components/responsive-flex/responsive-flex';
import {
    HorizontalResizing,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
    VerticalResizing,
} from '@deps/components/responsive-flex/responsive-flex.types';
import BankingDetails from '@deps/components/side-sheet/banking-details/banking-details';
import { TranslationFiles } from '@deps/config/translations';
import { useContentContext } from '@deps/contexts/LayoutContexts/StaticContentContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString, toTitleCase } from '@deps/helpers/string.helper';
import { ReactComponent as PaymentIcon } from '@deps/styles/elements/icons/content/payment.svg';

import { UpcomingPaymentCardProps, UpcomingPaymentCardTest } from './card-upcoming-payment.types';
import PendingUpcomingBanner from './pending-upcoming-banner/pending-upcoming-banner';

const UpcomingPaymentCard = ({
    title,
    inactiveText,
    inactiveHeaderText,
    inactiveIcon = <PaymentIcon width={50} height={50} className="text-gray-300" />,
    paymentText,
    paymentDate,
    paymentDateText,
    bankDetails,
    autopayAmount = 0,
    paymentFrequencyText,
    additionalChargesTitle,
    additionalCharges,
    footerLinks,
    className,
    titleCase = true,
    requestSubTypes,
}: UpcomingPaymentCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'premium.upcoming',
    });
    const { globalValuesData } = useContentContext();
    const sideSheet = useSideSheetContext();

    const paymentAmount = autopayAmount + (additionalCharges?.reduce((a, b) => a + (b.amount || 0), 0) || 0);
    const hasUpcomingPayment = paymentAmount > 0;

    const activityPaymentDate = convertKebabedDateString(paymentDate || '');

    const openBankingSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <PolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <BankingDetails bankDetails={bankDetails} />
        );
        sideSheet.handleOpen(true);
    };

    if (title?.length) {
        title = titleCase ? toTitleCase(title) : title;
    } else {
        title = `${t('upcomingAutopay')}`;
    }

    return (
        <>
            <PendingUpcomingBanner policyNumber={globalValuesData.policyNumber} requestSubTypes={requestSubTypes} />
            <CardSection
                data-testid={UpcomingPaymentCardTest.CONTAINER}
                className={className}
                headerContent={<h2 className="headline-2">{title}</h2>}
                footerContent={footerLinks}
            >
                {hasUpcomingPayment ? (
                    <>
                        <ResponsiveFlex
                            data-testid={UpcomingPaymentCardTest.ACTIVE}
                            layoutDirection={LayoutDirection.Vertical}
                            horizontalResizing={HorizontalResizing.Hug}
                            verticalResizing={VerticalResizing.Hug}
                            layoutAlignment={LayoutAlignment.TopLeft}
                            itemSpacing={ItemSpacing.XSmall}
                            className="md:gap-6 lg:gap-8"
                        >
                            <FieldData label={paymentText || t('paymentText')} variant={FieldDataVariant.Large}>
                                {numberFormatify(paymentAmount)}
                            </FieldData>
                            <FieldData label={`${paymentDateText || t('paymentDateText')} ${activityPaymentDate}`}>
                                {bankDetails?.accountNumber && (
                                    <NavElement onClick={openBankingSidesheet} size={NavElementSize.Small} type={NavElementType.Button}>
                                        <PiiWrapper>
                                            {toTitleCase(bankDetails.accountType) +
                                                t('endingIn') +
                                                bankDetails?.accountNumber?.substring(bankDetails?.accountNumber.length - 4)}
                                        </PiiWrapper>
                                    </NavElement>
                                )}
                            </FieldData>
                        </ResponsiveFlex>
                        {additionalCharges?.length && (
                            <CardTransactions
                                title={
                                    paymentFrequencyText ||
                                    t('paymentFrequencyText', {
                                        paymentMode: t('paymentMode.monthly'),
                                        paymentType: t('paymentType.premium'),
                                    })
                                }
                                premium={autopayAmount}
                                additionalChargesTitle={additionalChargesTitle || t('additionalCharges.text')}
                                additionalCharges={additionalCharges}
                            />
                        )}
                    </>
                ) : (
                    <CardInfo
                        data-testid={UpcomingPaymentCardTest.INACTIVE}
                        className="flex h-[195px] w-full max-w-[inherit] flex-col justify-center rounded border-2 border-dashed border-gray-100 bg-gray-50"
                        icon={inactiveIcon}
                        title={inactiveHeaderText || t('inactive.header')}
                        subtitle={inactiveText || t('inactive.text')}
                    />
                )}
            </CardSection>
        </>
    );
};

export default UpcomingPaymentCard;
