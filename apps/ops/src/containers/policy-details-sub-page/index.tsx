import { useContext } from 'react';

import Accordion from '@deps/components/accordion/accordion';
import DetailsCard from '@deps/components/card/card-details';
import DescriptionLists from '@deps/components/description-list/description-lists';
import PageHeader from '@deps/components/page-header/page-header';
import DepTable from '@deps/components/table/table';
import Section from '@deps/containers/section/section';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { CostBasisDto, CostBasisInfo, toCostBasisDto } from '@deps/data/details/policy-cost-basis';
import {
    PolicyCoverageDto,
    PolicyCoverageInfo,
    PolicyDecreaseInfo,
    PolicyIncreaseInfo,
    toCoverageDto,
} from '@deps/data/details/policy-coverage';
import {
    PolicyCoverageLayerDto,
    PolicyCoverageLayerInfo,
    PolicyCoverageLayerInsuredTieDto,
    PolicyCoverageLayerTestInfo,
    coverageLayerColumns,
    coverageLayerInsuredTieColums,
    toPolicyCoverageLayerDto,
    toPolicyCoverageLayerInsuredTieDto,
    toPolicyCoverageLayerTestDto,
    toPolicyCoverageLayersDto,
} from '@deps/data/details/policy-coverage-layer';
import { PolicyDatesDto, PolicyDatesInfo, toPolicyDatesDto } from '@deps/data/details/policy-dates';
import { DeathBenefitDto, PolicyDeathBenefitInfo, toDeathBenefitDto } from '@deps/data/details/policy-death-benefit';
import { PolicyDetailsDto, PolicyDetailsInfo, toPolicyDetailsDto } from '@deps/data/details/policy-details';
import { LoanValuesDto, PolicyLoansInfo, toLoanValuesDto } from '@deps/data/details/policy-loans';
import { PolicyTestsGPTInfo, PolicyTestsMECInfo, TestValuesDto, toTestValuesDto } from '@deps/data/details/policy-tests';
import { PolicyValuesDto, PolicyValuesInfo, toPolicyValuesDto } from '@deps/data/details/policy-values';
import { PolicyWithdrawalsInfo, WithdrawalValuesDto, toWithdrawalValuesDto } from '@deps/data/details/policy-withdrawals';
import { fillColDefs } from '@deps/helpers/data-transform.helper';
import { AccountValues, PolicyCoverage } from '@deps/models/policy/sor-policy';
import { ReactComponent as ShieldMagnify } from '@deps/styles/elements/icons/icons_outlined/shield-magnify.svg';
import { CardInfoVariant } from '@deps/types/components';

const PolicyDetailsSubPage = () => {
    const { policy } = useContext(PolicyData);
    const policyDetailsDto: PolicyDetailsDto = toPolicyDetailsDto(policy);
    const policyDetails = fillColDefs<PolicyDetailsDto>(policyDetailsDto, PolicyDetailsInfo());
    const policyDetailsList = <DescriptionLists data={policyDetails} />;
    const policyDatesDto: PolicyDatesDto = toPolicyDatesDto(policy);
    const policyDates = fillColDefs<PolicyDatesDto>(policyDatesDto, PolicyDatesInfo());
    const policyDatesList = <DescriptionLists data={policyDates} />;
    const costBasisDto: CostBasisDto = toCostBasisDto(policy);
    const costBasis = fillColDefs<CostBasisDto>(costBasisDto, CostBasisInfo());
    const costBasisList = <DescriptionLists data={costBasis} />;
    const policyValuesDto: PolicyValuesDto = toPolicyValuesDto(policy);
    const policyValues = fillColDefs<PolicyValuesDto>(policyValuesDto, PolicyValuesInfo());
    const policyValuesList = <DescriptionLists data={policyValues} />;
    const policyCoverageDto: PolicyCoverageDto = toCoverageDto(policy);
    const policyCoverage = fillColDefs<PolicyCoverageDto>(policyCoverageDto, PolicyCoverageInfo());
    const policyCoverageList = <DescriptionLists data={policyCoverage} />;
    const policyDecrease = fillColDefs<PolicyCoverage>(policyCoverageDto, PolicyDecreaseInfo());
    const policyDecreaseList = <DescriptionLists data={policyDecrease} />;
    const policyIncrease = fillColDefs<PolicyCoverage>(policyCoverageDto, PolicyIncreaseInfo());
    const policyIncreaseList = <DescriptionLists data={policyIncrease} />;
    const policyCoverageLayersDto: PolicyCoverageLayerDto[] = policy ? toPolicyCoverageLayersDto(policy) : ([] as PolicyCoverageLayerDto[]);
    const policyCoverageLayerInsuredTieDto: PolicyCoverageLayerInsuredTieDto[] = policy
        ? toPolicyCoverageLayerInsuredTieDto(policy)
        : ([] as PolicyCoverageLayerInsuredTieDto[]);
    const policyCoverageLayerDto: PolicyCoverageLayerDto = toPolicyCoverageLayerDto(policy);
    const policyCoverageLayer = fillColDefs<PolicyCoverage>(policyCoverageLayerDto, PolicyCoverageLayerInfo);
    const policyCoverageLayerList = <DescriptionLists data={policyCoverageLayer} />;
    const policyCoverageLayerTestDto: PolicyCoverageLayerDto = toPolicyCoverageLayerTestDto(policy);
    const policyCoverageLayerTest = fillColDefs<PolicyCoverageLayerDto>(policyCoverageLayerTestDto, PolicyCoverageLayerTestInfo);
    const policyCoverageLayerTestList = <DescriptionLists data={policyCoverageLayerTest} />;
    const policyMetricsDto: AccountValues | undefined = toPolicyValuesDto(policy);
    const policyMetrics = fillColDefs<PolicyValuesDto>(policyMetricsDto, PolicyValuesInfo());
    const policyMetricsList = <DescriptionLists data={policyMetrics} />;
    const policyLoansDto: LoanValuesDto = toLoanValuesDto(policy);
    const policyLoans = fillColDefs<LoanValuesDto>(policyLoansDto, PolicyLoansInfo());
    const policyLoansList = <DescriptionLists data={policyLoans} />;
    const policyWithdrawalsDto: WithdrawalValuesDto = toWithdrawalValuesDto(policy);
    const policyWithdrawals = fillColDefs<WithdrawalValuesDto>(policyWithdrawalsDto, PolicyWithdrawalsInfo());
    const policyWithdrawalsList = <DescriptionLists data={policyWithdrawals} />;
    const policyTestsDto: TestValuesDto = toTestValuesDto(policy);
    const policyTestGPT = fillColDefs<TestValuesDto>(policyTestsDto, PolicyTestsGPTInfo());
    const policyTestMEC = fillColDefs<TestValuesDto>(policyTestsDto, PolicyTestsMECInfo());
    const policyTestGPTList = <DescriptionLists data={policyTestGPT} />;
    const policyTestMECList = <DescriptionLists data={policyTestMEC} />;
    const policyDeathBenefitDto: DeathBenefitDto = toDeathBenefitDto(policy);
    const policyDeathBenefit = fillColDefs<DeathBenefitDto>(policyDeathBenefitDto, PolicyDeathBenefitInfo());
    const policyDeathBenefitList = <DescriptionLists data={policyDeathBenefit} />;

    const page = (
        <>
            <Section>
                <Accordion isOpen={true} title={'Policy Details'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyDetailsList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Policy Dates'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyDatesList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Cost Basis'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[costBasisList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Account Value Group'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyValuesList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Policy Coverage'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyCoverageList]}>
                        <div className="container mx-auto">
                            <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyDecreaseList]} titles={['Decrease']} />
                            <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyIncreaseList]} titles={['Increase']} />
                            <DepTable cols={coverageLayerColumns} rowData={policyCoverageLayersDto} />
                            <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyCoverageLayerList]} titles={['Coverage Layer']}>
                                <div className="container mx-auto">
                                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyCoverageLayerTestList]} titles={['Test']}>
                                        <DepTable cols={coverageLayerInsuredTieColums} rowData={policyCoverageLayerInsuredTieDto} />
                                    </DetailsCard>

                                    <br />
                                </div>
                            </DetailsCard>
                        </div>
                    </DetailsCard>
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Policy Metrics'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyMetricsList]}>
                        <div className="container mx-auto">
                            <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyLoansList]} titles={['Loans']} />
                        </div>
                        <div className="container mx-auto">
                            <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyWithdrawalsList]} titles={['Withdrawals']} />
                        </div>
                    </DetailsCard>
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Test GPT'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyTestGPTList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Test MEC'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyTestMECList]} />
                </Accordion>
            </Section>

            <Section>
                <Accordion isOpen={false} title={'Death Benefit'}>
                    <DetailsCard variant={CardInfoVariant.DEFAULT} items={[policyDeathBenefitList]} />
                </Accordion>
            </Section>
        </>
    );

    return (
        <>
            <PageHeader headerText="Policy Details" icon={<ShieldMagnify />} />
            {page}
        </>
    );
};

export default PolicyDetailsSubPage;
