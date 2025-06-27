import { Skeleton } from '@radix-ui/themes';
import { HTMLProps } from 'react';

import { filterTruthyProps } from '@deps/helpers/data-transform.helpers';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { PolicyExtrasTest } from '@deps/jest/constants/test-id-constants';

import { ContentVariant } from '../content/content';
import Label, { LabelVariant, LabelProps } from '../label/label';
import Title, { TitleVariant } from '../title/title';
import Typography, { TypographyVariant } from '../typography/typography';

export type PolicyExtrasHeaderProps = HTMLProps<HTMLElement> & {
    headerText: string;
    subheader: (string | null)[];
    labelText: string;
} & Pick<LabelProps, 'tooltipTitle' | 'tooltipBody' | 'tooltipPlacement'>;

const renderSubheader = (subheader: (string | null)[]) =>
    subheader ? (
        subheader.map((sentence, index) => (
            <span
                key={`subheader-sentence-${index}`}
                className={`content-${ContentVariant.Body} leading-5`}
            >
                <Skeleton
                    loading={sentence === null}
                    maxWidth="580px"
                    height="24px"
                >
                    <Typography
                        data-testid={PolicyExtrasTest.SUBHEADER}
                        variant={TypographyVariant.Body}
                    >
                        {sentence}
                    </Typography>
                </Skeleton>
            </span>
        ))
    ) : (
        <></>
    );

const PolicyExtrasHeader = ({
    headerText,
    subheader,
    labelText,
    tooltipBody,
    tooltipPlacement,
    tooltipTitle,
}: PolicyExtrasHeaderProps) => (
    <header
        data-testid={PolicyExtrasTest.CONTAINER}
        className="align-center flex flex-col content-start justify-start"
    >
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
        <Title variant={TitleVariant.SubTitle}>
            {toSentenceCase(headerText)}
        </Title>
        <div className="break-words">{renderSubheader(subheader)}</div>
    </header>
);

export default PolicyExtrasHeader;
