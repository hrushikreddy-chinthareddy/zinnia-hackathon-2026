import { Button } from '@zinnia/bloom/components';
import { RenderingSection, RenderingSubsection } from '@zinnia/form-engine-sdk';
import { memo, ReactElement } from 'react';

import style from './SectionView.module.css';
import { useActiveSection } from '../../../providers/ActiveSectionProvider';
import { SubsectionView } from '../subsection/SubsectionView';

type SectionViewProps = {
    section: RenderingSection;
};

export function InnerSectionView(props: SectionViewProps): ReactElement {
    const { section } = props;

    const { onNextSection } = useActiveSection();

    return (
        <div className={style.sectionWrapper}>
            <div>
                {section.subsections.map(
                    (subsection: RenderingSubsection) =>
                        subsection.visible && (
                            <SubsectionView
                                key={subsection.id}
                                subsection={subsection}
                            />
                        )
                )}
            </div>

            {onNextSection && (
                <div className={style.nextButtonWrapper}>
                    <Button size="small" onClick={onNextSection}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

export const SectionView = memo(InnerSectionView);
