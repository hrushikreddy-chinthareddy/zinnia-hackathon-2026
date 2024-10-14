import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import { ButtonSize } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import SpinnerButton from '@deps/components/spinner-button/spinner-button';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as ClockIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';

export interface TransactionCtaProps {
    className?: string;
    mainCta: {
        text: string;
        onClick: () => void;
    };
    secondaryCta?: {
        text: string;
        href?: string;
        onClick?: () => void;
    };
    stopLoading?: boolean;
}

const TransactionCta = ({ className, mainCta, secondaryCta, stopLoading }: TransactionCtaProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'transactions.transactionCta' });

    const [assistiveTextMessageIndex, setAssistiveTextMessageIndex] = useState(-1);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

    const assistiveTextMessages = [t('checkingRules'), t('creatingSummary'), t('upTo15'), t('stillWorking')];
    const hasSecondaryCta = secondaryCta != null;

    const startInterval = () => {
        const id = setInterval(() => {
            setAssistiveTextMessageIndex(prevIndex => {
                if (prevIndex === assistiveTextMessages.length - 1) {
                    clearInterval(id);

                    return prevIndex;
                }

                return prevIndex + 1;
            });
        }, 3000);

        setIntervalId(id);
    };

    const handleClick = () => {
        startInterval();
        mainCta.onClick();
    };

    if (stopLoading) clearInterval(intervalId);

    return (
        <div className={clsx('flex flex-col gap-4', className)}>
            <div className="flex items-center gap-8">
                <SpinnerButton stopLoading={stopLoading} size={ButtonSize.Small} text={mainCta.text} onClick={handleClick} />
                {hasSecondaryCta &&
                    (secondaryCta?.onClick ? (
                        <NavElement
                            aria-label={secondaryCta.text}
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            variant={NavElementVariant.Default}
                            onClick={secondaryCta.onClick}
                        >
                            {secondaryCta.text}
                        </NavElement>
                    ) : (
                        <a
                            className="default-focus font-primary text-links-sm font-semibold text-secondary hover:text-secondary-dark hover:underline hover:decoration-2 hover:underline-offset-[6px] focus-visible:rounded"
                            href={secondaryCta.href}
                            data-testid="leave-transaction"
                        >
                            {secondaryCta.text}
                        </a>
                    ))}
            </div>

            {!!assistiveTextMessages[assistiveTextMessageIndex] && (
                <AssistiveText
                    iconOverride={<ClockIcon height={16} width={16} />}
                    text={assistiveTextMessages[assistiveTextMessageIndex]}
                />
            )}
        </div>
    );
};

export default TransactionCta;
