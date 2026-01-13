import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { DocumentData } from '@deps/models/case/document';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import BankUpdateForm from './bank-update-form';
import GlobalValuesBar from '../../global-values/global-values-bar/global-values-bar';

type BankUpdateContainerProps = {
    clientCode: string;
    policy: Policy;
    document: DocumentData;
};

const BankUpdateContainer = ({
    clientCode,
    policy,
    document,
}: BankUpdateContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(new PolicyDetails(policy), t),
        [policy, t]
    );

    const {
        marketingName,
        planCode,
        policyNumber,
        productType,
        status,
        tooltip,
        variant,
    } = globalValuesData;
    const policyOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.OWNER
    )?.partyId;

    const policyOwner = policy?.parties?.find(
        (party) => party.partyId === policyOwnerId
    );

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center bg-gray-100 py-4">
            <div className="flex">
                <GlobalValuesBar
                    carrierId={clientCode}
                    marketingName={marketingName}
                    owner={policyOwner}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    productType={productType}
                    status={status}
                    tooltip={tooltip}
                    variant={variant}
                    showJointOwner={false}
                    showDocument={false}
                    showLink={false}
                />
            </div>

            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04 p-4">
                <BankUpdateForm document={document} />
            </div>
        </div>
    );
};

export default BankUpdateContainer;
