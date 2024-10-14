import { CardDetailsTest } from '@deps/jest/constants/test-id-constants';
import { CardInfoVariant } from '@deps/types/components';

import CardColumns from './card-columns/card-columns';

interface CardDetailsProps {
    icon?: JSX.Element;
    items: JSX.Element[];
    titles?: string[];
    header?: JSX.Element;
    variant?: CardInfoVariant;
    accordion?: boolean;
    accordionName?: string;
    defaultExpanded?: boolean;
    children?: React.ReactNode;
    classNames?: string;
}

const DetailsCard = ({ titles, header, items, classNames, children }: CardDetailsProps) => {
    let details;
    let variantColor;

    const columns = <CardColumns titles={titles} items={items} />;

    const detailClasses = 'min-w-[275px] min-h-[390px] !p-0 shadow-sm bg-white rounded mb-4';
    const cardClasses = `${detailClasses} ${variantColor} ${classNames}`;

    const card = (
        <article data-testid={CardDetailsTest.CARD} className={cardClasses}>
            {header && (
                <header data-testid={CardDetailsTest.HEADER} className="px-8 pt-8">
                    <div className="flex items-end justify-between">{header}</div>
                    <hr className="mt-4 h-0.5 border-none bg-gray-100" />
                </header>
            )}
            <div data-testid={CardDetailsTest.CONTENT} className="px-8 pt-8">
                {columns}
            </div>
            <div className="pb-[34px]">{details}</div>
            {children}
        </article>
    );

    return <>{card}</>;
};

export default DetailsCard;
