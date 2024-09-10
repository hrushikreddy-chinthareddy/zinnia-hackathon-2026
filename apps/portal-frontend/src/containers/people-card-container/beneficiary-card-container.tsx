import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import AllocationColorBar, { AllocationColor } from '@deps/components/allocation-color-bar/allocation-color-bar';
import { LabelVariant, labelMapping } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import TempNavInactive, { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { ReactComponent as SettingsIcon } from '@deps/styles/elements/icons/actions/settings.svg';

import PeopleCardContainer from './people-card-container';
import { getBeneficiaryColor, getContigentColor } from './people-card-container.helper';
import { BeneficiaryType, PeopleCardContainerProps } from './people-card-container.types';
import { NameTag } from '../people-sub-page/people-sub-page.helpers';

interface BeneficiaryCardContainerProps extends PeopleCardContainerProps {
    openAllocationSideSheet?: () => void;
    title: string;
    type?: BeneficiaryType;
    showAllocationBar?: boolean;
}

const peopleDataToColors = (filteredData: NameTag[], type: BeneficiaryType): AllocationColor[] => {
    return filteredData.map((nt, index) => ({
        allocationPercentage: nt.beneficiaryPercentage?.toString() || '0',
        className: type === BeneficiaryType.PRIMARY ? getBeneficiaryColor(index) : getContigentColor(index),
    }));
};

const BeneficiaryCardContainer = ({
    title,
    type = BeneficiaryType.PRIMARY,
    filteredData,
    classNames,
    openAllocationSideSheet = () => {
        return;
    },
    peopleCardData,
    showAllocationBar = true,
}: BeneficiaryCardContainerProps) => {
    const { t } = useTranslation();
    const colors: AllocationColor[] = showAllocationBar ? peopleDataToColors(filteredData, type) : [];

    const classes = clsx('mb-[9px]', labelMapping[LabelVariant.FieldLabel].styles);

    return (
        <div className={classNames}>
            <div className="flex items-start justify-between">
                <span className={classes}>{toSentenceCase(title)}</span>
                {isStillInactive.beneficiaryCardContainer ? (
                    // https://zinnia.atlassian.net/browse/DEPU-1936
                    <TempNavInactive tooltipBody={isStillInactive.beneficiaryCardContainer} navElementClassName="mb-2">
                        {t('beneficiary-card.modifyAllocations')}
                    </TempNavInactive>
                ) : (
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        startIcon={<SettingsIcon width={20} height={20} />}
                        className="flex items-start"
                        onClick={openAllocationSideSheet}
                    >
                        {t('beneficiary-card.modifyAllocations')}
                    </NavElement>
                )}
            </div>
            {showAllocationBar && <AllocationColorBar colors={colors} />}
            <PeopleCardContainer classNames="mt-6" filteredData={filteredData} peopleCardData={peopleCardData} />
        </div>
    );
};

export default BeneficiaryCardContainer;
