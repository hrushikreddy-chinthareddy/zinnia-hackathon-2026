import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';

import { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import BannerAlert, { BannerVariant } from '@deps/components/banner-alert/banner-alert';
import CardInfo from '@deps/components/card/card-info/card-info';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import { ValidationResult } from '@deps/queries/api/bpm';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

import { ViewState } from '../non-financial-transactions/states/states.helpers';

interface BpmErrorStateProps {
    children: React.ReactNode;
    onCancel: () => void;
    onContinue: () => void;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    validationResults?: ValidationResult[];
}

const BpmErrorState = ({ children, onCancel, onContinue, setViewState, validationResults }: BpmErrorStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'transactions.states.bpmError' });

    const [isNigoSelected, setIsNigoSelected] = useState(false);
    const [showAcknowledgeNigoError, setShowAcknowledgeNigoError] = useState(false);
    const [stopLoading, setStopLoading] = useState(true);

    return (
        <div className="flex flex-col">
            <CardInfo
                className="my-8"
                icon={<HexExclamationIcon className="text-semantic-error" height={50} width={50} />}
                subtitle={t('subtitle')}
                title={t('title')}
            />
            <div className="flex flex-col gap-6 px-8">
                <div className="flex gap-6 rounded border-2 border-gray-200 p-6">
                    {children}
                    <NavElement
                        className="w-fit"
                        onClick={() => setViewState(ViewState.Default)}
                        size={NavElementSize.Small}
                        startIcon={<EditIcon height={16} width={16} />}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('edit')}
                    </NavElement>
                </div>

                {!!validationResults?.length &&
                    validationResults.map(validationResult => {
                        const { error, errorCode, resolution } = validationResult;
                        return (
                            <BannerAlert canDismiss={false} key={`bpm-validation-banner-${errorCode}`} variant={BannerVariant.Error}>
                                <b>{error}</b> {resolution}
                            </BannerAlert>
                        );
                    })}

                <CheckboxText
                    assistiveText={showAcknowledgeNigoError ? { text: t('nigoAssistive'), variant: AssistiveTextVariant.Error } : undefined}
                    checked={isNigoSelected}
                    label={t('nigo')}
                    onChange={() => {
                        setIsNigoSelected(prevState => {
                            if (!prevState) setShowAcknowledgeNigoError(false);
                            return !prevState;
                        });
                    }}
                />

                <TransactionCta
                    className="mt-4"
                    mainCta={{
                        onClick: () => {
                            if (!isNigoSelected) {
                                setShowAcknowledgeNigoError(true);
                            } else {
                                setStopLoading(false);
                                onContinue();
                            }
                        },
                        text: t('cta'),
                    }}
                    secondaryCta={{
                        onClick: onCancel,
                        text: t('secondaryCta'),
                    }}
                    stopLoading={stopLoading}
                />
            </div>
        </div>
    );
};

export default BpmErrorState;
