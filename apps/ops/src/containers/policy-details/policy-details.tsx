import { Heading, HeadingVariant, Loader } from '@zinnia/bloom/components';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@deps/components/modal/modal';
import PolicyDetailsHeaderCard from '@deps/containers/page-header/policy-details-header';
import { AnnuityApplicationDetailsCard } from '@deps/containers/policy-details/cards/application-details/annuity-application-details-card';
import { PolicyApplicationDetailsCard } from '@deps/containers/policy-details/cards/application-details/policy-application-details-card';
import { CostBasisQualificationCard } from '@deps/containers/policy-details/cards/cost-basis-qualification-card';
import ProductDetailsCard from '@deps/containers/policy-details/cards/product-details-card';
import {
    AnnuityTimelineCard,
    LifeTimelineCard,
} from '@deps/containers/policy-details/cards/timeline-card';
import {
    AnnuitantCard,
    InsuredCard,
} from '@deps/containers/shared-cards/covered-parties/covered-parties-card';
import { useModalContext } from '@deps/contexts/ModalContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';

import { PolicyFinancialsCard } from './cards/policy-financials-card';
import { PolicyDetailsCard } from '../policy-summary-card/policy-details-card';

const AnnuityPolicyDetailsContainer = () => {
    const { policy, policyDetails } = useContext(PolicyData);
    const { t } = useTranslation();
    const { isModalOpen, setIsModalOpen } = useModalContext();

    return (
        <>
            <PolicyDetailsHeaderCard
                policy={policyDetails}
                belowHeaderTextChildren={
                    <PolicyDetailsCard
                        isLoading={false}
                        policyDetails={policyDetails}
                    />
                }
            />
            <hr className="border-t-2 border-gray-200" />
            <PolicyFinancialsCard policy={policyDetails} />
            <AnnuitantCard policy={policyDetails} />
            <CostBasisQualificationCard policy={policyDetails} />
            <AnnuityTimelineCard policy={policyDetails} />
            <AnnuityApplicationDetailsCard policy={policy} />
            <ProductDetailsCard policy={policyDetails} />

            {isModalOpen && (
                <Modal
                    open={isModalOpen}
                    closeIcon="X"
                    delayCloseIconMs={5}
                    onCancel={() => {
                        setIsModalOpen(false);
                    }}
                    content={
                        <div className="flex flex-col items-center gap-4">
                            <Loader />
                            <Heading as={HeadingVariant.h3}>
                                {t(
                                    'quickActions.additionalActions.downloadingPdf'
                                )}
                            </Heading>
                        </div>
                    }
                />
            )}
        </>
    );
};

const LifePolicyDetailsContainer = () => {
    const { policyDetails } = useContext(PolicyData);
    const { t } = useTranslation();
    const { isModalOpen, setIsModalOpen } = useModalContext();

    return (
        <>
            <PolicyDetailsHeaderCard
                policy={policyDetails}
                belowHeaderTextChildren={
                    <PolicyDetailsCard
                        isLoading={false}
                        policyDetails={policyDetails}
                    />
                }
            />
            <hr className="border-t-2 border-gray-200" />
            <PolicyFinancialsCard policy={policyDetails} />
            <InsuredCard policy={policyDetails} />
            <LifeTimelineCard policy={policyDetails} />
            <PolicyApplicationDetailsCard policy={policyDetails} />
            <ProductDetailsCard policy={policyDetails} />

            {isModalOpen && (
                <Modal
                    open={isModalOpen}
                    closeIcon="X"
                    delayCloseIconMs={5}
                    onCancel={() => {
                        setIsModalOpen(false);
                    }}
                    content={
                        <div className="flex flex-col items-center gap-4">
                            <Loader />
                            <Heading as={HeadingVariant.h3}>
                                {t(
                                    'quickActions.additionalActions.downloadingPdf'
                                )}
                            </Heading>
                        </div>
                    }
                />
            )}
        </>
    );
};

const PolicyDetailsSubPage = () => {
    const { policyDetails } = useContext(PolicyData);

    if (policyDetails.isAnnuity) {
        return <AnnuityPolicyDetailsContainer />;
    }

    if (policyDetails.isLife) {
        return <LifePolicyDetailsContainer />;
    }

    return <LifePolicyDetailsContainer />;
};

export default PolicyDetailsSubPage;
