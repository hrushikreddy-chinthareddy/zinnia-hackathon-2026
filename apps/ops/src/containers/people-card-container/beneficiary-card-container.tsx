import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import AllocationColorBar, {
    AllocationColor,
} from '@deps/components/allocation-color-bar/allocation-color-bar';
import { LabelVariant, labelMapping } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { toSentenceCase } from '@deps/helpers/string.helpers';

import PeopleCardContainer from './people-card-container';
import {
    getBeneficiaryColor,
    getContigentColor,
} from './people-card-container.helpers';
import {
    AgentType,
    BeneficiaryType,
    PeopleCardContainerProps,
} from './people-card-container.types';
import { useBeneChange } from '../bene-change/bene-change-provider';
import { NameTag } from '../people-sub-page/people-sub-page.helpers';

interface BeneficiaryCardContainerProps extends PeopleCardContainerProps {
    openAllocationSideSheet?: () => void;
    title: string;
    type?: BeneficiaryType | AgentType;
    showAllocationBar?: boolean;
    isRereg?: boolean;
    tooltip?: string;
    disabled?: boolean;
    cardDisableTooltip?: string;
    manageBeneficiary?: () => void;
    showManageBeneficiary?: boolean;
    enableManageBeneficiary?: boolean;
}

const peopleDataToColors = (
    filteredData: NameTag[],
    type: BeneficiaryType | AgentType
): AllocationColor[] => {
    return filteredData.map((nt, index) => {
        const allocationPercentageValue =
            type === BeneficiaryType.PRIMARY ||
            type === BeneficiaryType.CONTIGENT
                ? nt.beneficiaryPercentage?.toString()
                : nt.agentPercentage?.toString();

        const finalAllocationPercentage = allocationPercentageValue ?? '0';

        return {
            allocationPercentage: finalAllocationPercentage,
            className:
                type === BeneficiaryType.PRIMARY || type === AgentType.PRIMARY
                    ? getBeneficiaryColor(index)
                    : getContigentColor(index),
        };
    });
};

const BeneficiaryCardContainer = ({
    title,
    type = BeneficiaryType.PRIMARY,
    filteredData,
    classNames,
    peopleCardData,
    showAllocationBar = true,
    isRereg = false,
    tooltip,
    showManageBeneficiary = false,
    enableManageBeneficiary = false,
}: BeneficiaryCardContainerProps) => {
    const { t } = useTranslation();
    const colors: AllocationColor[] = showAllocationBar
        ? peopleDataToColors(filteredData, type)
        : [];
    const { isAgentSelected } = peopleCardData;

    const classes = clsx(
        'mb-[9px]',
        labelMapping[LabelVariant.FieldLabel].styles
    );

    const { setIsPeopleView } = useBeneChange();
    const router = useRouter();

    const navigateToBeneChange = () => {
        setIsPeopleView(false);
        router.push(
            {
                pathname: `${router.pathname}/benechange`,
                query: router.query,
            },
            undefined,
            { shallow: true }
        );
    };

    return (
        <div className={classNames}>
            <div className="flex items-center justify-between">
                <span className={classes}>{toSentenceCase(title)}</span>
                {!isRereg && showManageBeneficiary && (
                    <span className="bg-gray-50 p-2 mb-1 text-center">
                        <NavElement
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            startIcon={null}
                            className="flex items-start"
                            onClick={navigateToBeneChange}
                            disabled={!enableManageBeneficiary}
                        >
                            {t('quickActions.people.manageBeneficiaries')}
                        </NavElement>
                    </span>
                )}
            </div>
            {showAllocationBar && <AllocationColorBar colors={colors} />}
            <PeopleCardContainer
                classNames="mt-6"
                filteredData={filteredData}
                peopleCardData={peopleCardData}
                isRereg={!isAgentSelected}
                type={type}
            />
        </div>
    );
};

export default BeneficiaryCardContainer;
