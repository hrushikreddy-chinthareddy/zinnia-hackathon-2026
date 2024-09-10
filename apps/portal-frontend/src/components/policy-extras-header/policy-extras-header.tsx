import { HTMLProps, ReactNode } from 'react';

import { filterTruthyProps } from '@deps/helpers/data-transform.helper';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { PolicyExtrasTest } from '@deps/jest/constants/test-id-constants';

import { ContentVariant } from '../content/content';
import Label, { LabelVariant, LabelProps } from '../label/label';
import Title, { TitleVariant } from '../title/title';

export type PolicyExtrasHeaderProps = HTMLProps<HTMLElement> & {
    headerText: string;
    subheaderNode: ReactNode;
    labelText: string;
} & Pick<LabelProps, 'tooltipTitle' | 'tooltipBody' | 'tooltipPlacement'>;

const PolicyExtrasHeader = ({
    headerText,
    subheaderNode,
    labelText,
    tooltipBody,
    tooltipPlacement,
    tooltipTitle,
}: PolicyExtrasHeaderProps) => (
    <header data-testid={PolicyExtrasTest.CONTAINER} className="align-center flex flex-col content-start justify-start">
        <Label
            className="order-first h-6"
            sentenceCase={false}
            label={toSentenceCase(labelText)}
            variant={LabelVariant.FieldLabel}
            // we don't want tooltip to show up
            // if tooltip props aren't passed
            {...filterTruthyProps({
                tooltipBody,
                tooltipPlacement,
                tooltipTitle,
            })}
        />
        <Title variant={TitleVariant.SubTitle}>{toSentenceCase(headerText)}</Title>
        <div className="break-words">
            <span className={`content-${ContentVariant.Body}`}>{subheaderNode}</span>
        </div>
    </header>
);

export default PolicyExtrasHeader;
