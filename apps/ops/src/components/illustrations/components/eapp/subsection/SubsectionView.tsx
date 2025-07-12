import {
    RenderingFieldGroup,
    RenderingSubsection,
} from '@zinnia/form-engine-sdk';
import ReactHtmlParser from 'html-react-parser';
import { ReactElement, memo } from 'react';

import style from './SubsectionView.module.css';
import { FieldGroup } from '../field-group/FieldGroup';

type SubsectionViewProps = {
    subsection: RenderingSubsection;
};

export const SubsectionView = memo(InnerSubsectionView);

export function InnerSubsectionView(
    props: SubsectionViewProps
): ReactElement | null {
    const { subsection } = props;

    if (!subsection.visible) return null;

    return (
        <div className={style.subsectionContainer}>
            <div className={style.subsectionHeaderWrapper}>
                {subsection.title && (
                    <div>
                        {subsection.title ? (
                            <h2 className="typography-desktop-headline-3-d">
                                {ReactHtmlParser(subsection.title)}
                            </h2>
                        ) : null}
                    </div>
                )}
                {subsection.text && (
                    <div>
                        <p className="typography-content-body">
                            {ReactHtmlParser(subsection.text)}
                        </p>
                    </div>
                )}
            </div>

            {subsection.fieldGroups.map((fieldGroup: RenderingFieldGroup) => (
                <FieldGroup key={fieldGroup.id} fieldGroup={fieldGroup} />
            ))}
        </div>
    );
}
