import clsx from 'clsx';
import { ReactNode } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';

export enum InactivePremiumCardTest {
    Container = 'inactive-premium-card-container-test-id',
}
export interface InactivePremiumCardProps {
    date?: string;
    icon?: ReactNode;
    text?: string | ReactNode;
    header: string;
}

const InactivePremiumCard = ({
    text,
    icon,
    header,
}: InactivePremiumCardProps) => {
    const contentClasses = clsx(
        'w-full max-w-[339px] flex-shrink-0 text-center sm:w-auto',
        {
            flex: typeof text === 'string',
        }
    );

    return (
        <div
            data-testid={InactivePremiumCardTest.Container}
            className="flex h-[195px] w-full flex-col justify-center gap-4 rounded border-2 border-dashed border-gray-100 bg-gray-50 align-middle text-gray-900"
        >
            <div className="flex flex-col items-center justify-center gap-2 align-middle sm:flex-row">
                {icon}{' '}
                <Label
                    label={header || ''}
                    variant={LabelVariant.LabelLg}
                    className="text-center"
                />
            </div>
            <div className="flex w-full justify-center align-middle">
                {typeof text === 'string' ? (
                    <Content
                        details={text as string}
                        contentClassName={contentClasses}
                        variant={ContentVariant.BodySm}
                    />
                ) : (
                    <div className={contentClasses}>{text}</div>
                )}
            </div>
        </div>
    );
};

export default InactivePremiumCard;
