import { useTranslation } from 'next-i18next';
import { Fragment } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { CardColumnsTest } from '@deps/jest/constants/test-id-constants';

interface CardColumnsProps {
    items: JSX.Element[];
    titles?: string[];
    variant?: CardColumnsVariant;
    subHeader?: string;
    footer?: string;
    keepFormattingOnAllSize?: boolean;
}

export enum CardColumnsVariant {
    DEFAULT = 'default',
    SIDE_SHEET = 'side-sheet',
}

const CardColumns = ({
    titles,
    items,
    variant = CardColumnsVariant.DEFAULT,
    subHeader,
    footer,
    keepFormattingOnAllSize = false,
}: CardColumnsProps): JSX.Element => {
    const titleClassName = `${
        variant === CardColumnsVariant.SIDE_SHEET
            ? 'text-gray-900 leading-7.5'
            : ''
    } pb-3 font-primary text-xl font-medium`;

    const { t } = useTranslation();

    if (titles) {
        return (
            <div data-testid={CardColumnsTest.COLUMNS} className="lg:flex">
                <>
                    {titles.map((title: string, index: number) => {
                        return (
                            <Fragment key={'card-column-' + index + title}>
                                <div
                                    data-testid={`${CardColumnsTest.ITEMS}-${title}`}
                                    className={`mt-12 grow first:mt-0 md:mt-0 lg:border-r lg:border-r-gray-100 lg:pl-8 lg:first:pl-0 lg:last:border-none`}
                                >
                                    {variant ===
                                    CardColumnsVariant.SIDE_SHEET ? (
                                        <h2 className={titleClassName}>
                                            {title}
                                        </h2>
                                    ) : (
                                        <h3 className={titleClassName}>
                                            {title}
                                        </h3>
                                    )}
                                    {subHeader && (
                                        <Typography
                                            className="pb-8 pt-5"
                                            variant={TypographyVariant.Body}
                                        >
                                            {t(`${subHeader}`)}
                                        </Typography>
                                    )}
                                    <div
                                        className={`flex gap-8 ${
                                            keepFormattingOnAllSize
                                                ? 'md:flex'
                                                : 'md:block'
                                        } lg:flex`}
                                    >
                                        {items[index]}
                                    </div>
                                    {footer && (
                                        <Typography
                                            className="py-8"
                                            variant={TypographyVariant.Body}
                                        >
                                            {t(`${footer}`)}
                                        </Typography>
                                    )}
                                </div>
                            </Fragment>
                        );
                    })}
                </>
            </div>
        );
    }

    return <div>{items}</div>;
};

export default CardColumns;
