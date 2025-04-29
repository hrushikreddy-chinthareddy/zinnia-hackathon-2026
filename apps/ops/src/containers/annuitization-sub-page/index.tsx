import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import CardSection, { FooterContent } from '@deps/components/card/card-section/card-section';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import FieldData from '@deps/components/fields/field-data/field-data';
import ResponsiveFlex from '@deps/components/responsive-flex/responsive-flex';
import {
    HorizontalResizing,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
    VerticalResizing,
} from '@deps/components/responsive-flex/responsive-flex.types';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { ArrangementType, PolicyFeatureFeatureType } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, checkEligibilitySystematicPrograms } from '@deps/queries/api/bpm';

import { AnnuitizationPageHeader } from './annuitization-page-header';

export const AnnuitizationSubPage = () => {
    const { policyDetails, policy } = useContext(PolicyData);
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'annuitization',
    });
    const [isEligibleManagePayout, setIsEligibleManagePayout] = useState(false);
    const [ineligibleManagePayoutReason, setIneligibleManagePayoutReason] = useState('');

    const { parties, planCode, features, policyNumber, systematicPrograms } = policyDetails;
    const upcomingPayout = useMemo(() => systematicPrograms.getNextProgramByType('PAYMENT' as ArrangementType), [systematicPrograms]);
    const annuitizationFeature = features.getFirstFeatureByType('ANNUITIZATION' as PolicyFeatureFeatureType);

    // BPB - this is assuming there's one payee per systematic program.  If not, we need to figure out how to handle multiple payees
    const payeeInfo = upcomingPayout?.party?.[0];

    const payeeParty = parties.getPartyById(payeeInfo?.partyId || '');
    const payeeBankDetails = payeeParty?.banks?.getById(payeeInfo?.bankId || '');

    useEffect(() => {
        const checkManageAutopayEligibility = async () => {
            const arrangementId = upcomingPayout?.arrangementId || '';
            const manageAutopayEligibility = await checkEligibilitySystematicPrograms(planCode, policyNumber, arrangementId);

            if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                setIsEligibleManagePayout(true);
            } else {
                setIneligibleManagePayoutReason(formatValidationResult(manageAutopayEligibility?.validationResult));
            }
        };

        checkManageAutopayEligibility();
    }, [planCode, policyNumber, upcomingPayout]);

    const footerContent = [
        {
            text: t('manageAutopay'),
            href: `/policies/${planCode}/${policyNumber}/policy/annuitization/manage-autopay`, // BPB - this will need an update once we get the route and stuff
            isDisabled: !isEligibleManagePayout,
            tooltip: ineligibleManagePayoutReason,
        },
    ];

    return (
        <>
            <AnnuitizationPageHeader policy={policy} policyDetails={policyDetails} />
            <hr className="border-t-2 border-t-background" />
            <UpcomingPaymentCard
                bankDetails={payeeBankDetails}
                inactiveText={t('upcoming.inactive.text') as string}
                inactiveHeaderText={t('upcoming.inactive.header') as string}
                footerLinks={footerContent as FooterContent[]}
                autopayAmount={upcomingPayout?.amount}
                paymentText={t('upcoming.payoutAmount') as string}
                paymentDate={upcomingPayout?.nextProgramDate}
                paymentDateText={(!!upcomingPayout?.nextProgramDate && t('upcoming.payoutDateText')) || undefined}
                title={t('upcoming.title') as string}
            />
            <CardSection headerContent={<h2 className="font-primary headline-2">{t('details.header')}</h2>}>
                <ResponsiveFlex
                    layoutDirection={LayoutDirection.Horizontal}
                    horizontalResizing={HorizontalResizing.Hug}
                    verticalResizing={VerticalResizing.Hug}
                    layoutAlignment={LayoutAlignment.TopLeft}
                    itemSpacing={ItemSpacing.XSmall}
                    className="md:gap-6 lg:gap-8"
                >
                    <FieldData label={t('details.paymentAmount')}>{numberFormatify(annuitizationFeature?.paymentAmount)}</FieldData>
                    <FieldData label={t('details.startDate')}>{convertKebabedDateString(annuitizationFeature?.startDate)}</FieldData>
                    <FieldData label={t('details.endDate')}>{convertKebabedDateString(annuitizationFeature?.endDate)}</FieldData>
                    <FieldData label={t('details.totalPaymentAmount')}>
                        {numberFormatify(annuitizationFeature?.totalPaymentAmount)}
                    </FieldData>
                    <FieldData label={t('details.ytdPaymentAmount')}>{numberFormatify(annuitizationFeature?.totalPaymentAmount)}</FieldData>
                </ResponsiveFlex>
            </CardSection>
        </>
    );
};

export default AnnuitizationSubPage;
