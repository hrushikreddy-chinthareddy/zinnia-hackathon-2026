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
    BeneficiaryType,
    PeopleCardContainerProps,
} from './people-card-container.types';
import { useBeneChange } from '../bene-change/bene-change-provider';
import { NameTag } from '../people-sub-page/people-sub-page.helpers';

interface BeneficiaryCardContainerProps extends PeopleCardContainerProps {
    openAllocationSideSheet?: () => void;
    title: string;
    type?: BeneficiaryType;
    showAllocationBar?: boolean;
    isRereg?: boolean;
    manageBeneficiary?: () => void;
    showManageBeneficiary?: boolean;
    enableManageBeneficiary?: boolean;
}

const peopleDataToColors = (
    filteredData: NameTag[],
    type: BeneficiaryType
): AllocationColor[] => {
    return filteredData.map((nt, index) => ({
        allocationPercentage: nt.beneficiaryPercentage?.toString() || '0',
        className:
            type === BeneficiaryType.PRIMARY
                ? getBeneficiaryColor(index)
                : getContigentColor(index),
    }));
};

const BeneficiaryCardContainer = ({
    title,
    type = BeneficiaryType.PRIMARY,
    filteredData,
    classNames,
    peopleCardData,
    showAllocationBar = true,
    isRereg = false,
    showManageBeneficiary = false,
    enableManageBeneficiary = false,
}: BeneficiaryCardContainerProps) => {
    const { t } = useTranslation();
    const colors: AllocationColor[] = showAllocationBar
        ? peopleDataToColors(filteredData, type)
        : [];

    const classes = clsx(
        'mb-[9px]',
        labelMapping[LabelVariant.FieldLabel].styles
    );

    const { setIsPeopleView } = useBeneChange();
    const router = useRouter();

    return (
        <div className={classNames}>
            <div className="flex items-center justify-between">
                <span className={classes}>{toSentenceCase(title)}</span>
            </div>
            {showAllocationBar && <AllocationColorBar colors={colors} />}
            <PeopleCardContainer
                classNames="mt-6"
                filteredData={filteredData}
                peopleCardData={peopleCardData}
                isRereg={true}
            />
        </div>
    );
};

export default BeneficiaryCardContainer;
