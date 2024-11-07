import * as ReactTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import Image from 'next/image';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { commonPopoverClasses, commonTriggerClasses } from '@deps/components/popover/popover.helper';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as PaymentIcon } from '@deps/styles/elements/icons/content/payment.svg';
import { ReactComponent as AutopayIcon } from '@deps/styles/elements/icons/currency/autopay.svg';
import { ReactComponent as CashIcon } from '@deps/styles/elements/icons/icons_outlined/cash.svg';
import { ReactComponent as MenuHorizontal } from '@deps/styles/elements/icons/icons_outlined/menu-horizontal.svg';
import loaderImage from '@deps/styles/images/loader-contrast.png';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

interface TranslateProps {
    t: TFunction;
}

const TextButton = ({ t }: TranslateProps) => {
    return (
        <div className="items-center justify-center gap-1 text-secondary hover:text-secondary-dark md:flex">
            <p className="whitespace-nowrap font-primary text-md font-semibold hover:underline hover:decoration-2 hover:underline-offset-[5px]">
                {t('label')}
            </p>
            <ChevronDown className="simple-transition text-secondary group-data-[state=open]:rotate-180" height={16} width={16} />
        </div>
    );
};

const IconButton = React.forwardRef<HTMLButtonElement, TranslateProps>(function iconButtonForwardRef(props, forwardRef) {
    const { t, ...restProps } = props;

    return (
        <ReactTooltip.Trigger asChild className={clsx(commonTriggerClasses, 'w-full')} ref={forwardRef}>
            <button {...restProps} aria-label={t('ariaLabel') as string} className="!block">
                <MenuHorizontal className="text-secondary" height={24} title={t('label') as string} width={24} />
            </button>
        </ReactTooltip.Trigger>
    );
});

const MenuContextualContent = ({ t, planCode, policyNumber, eligibilityCheck, isLoading }: TranslateProps & QuickActionsMenuProps) => {
    const permissions = usePermissionsContext();
    const userPartyId = permissions.getUserPartyId();
    const { featureFlags } = useOptimizely();
    const freeLookEnabled = featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];

    return (
        <MenuContextualLabel label={t('transactions.label')}>
            {isLoading ? (
                <div className="h-[104px] w-[248px] content-center">
                    <Image alt={t('site.loader')} height={30} src={loaderImage} width={30} className="mx-auto my-[0px] animate-spin" />
                </div>
            ) : (
                <>
                    {eligibilityCheck?.eligibleFreeLookCancel && freeLookEnabled && (
                        <MenuContextualItem
                            content={t('transactions.cancelPolicy')}
                            href={`/policies/${planCode}/${policyNumber}/policy/freelook/cancel-freelook/`}
                            icon={<CashIcon height={20} width={20} />}
                            userPartyId={userPartyId}
                        />
                    )}
                    <MenuContextualItem
                        disabled={!eligibilityCheck?.eligibleAutopay as boolean}
                        content={t('transactions.managePremiumAutopay')}
                        href={`/policies/${planCode}/${policyNumber}/policy/premiums/update-premium-autopay/`}
                        icon={<AutopayIcon height={20} width={20} />}
                        userPartyId={userPartyId}
                    />

                    <MenuContextualItem
                        disabled={!eligibilityCheck?.eligiblePremium as boolean}
                        content={t('transactions.newPremium')}
                        href={`/policies/${planCode}/${policyNumber}/policy/premiums/new-premium/`}
                        icon={<PaymentIcon height={20} width={20} />}
                        userPartyId={userPartyId}
                    />

                    <MenuContextualItem
                        disabled={!eligibilityCheck?.eligibleWithdrawal as boolean}
                        content={t('transactions.startAWithdrawal')}
                        href={`/policies/${planCode}/${policyNumber}/policy/withdrawals/new-withdrawal/`}
                        icon={<CashIcon height={20} width={20} />}
                        userPartyId={userPartyId}
                    />
                </>
            )}
        </MenuContextualLabel>
    );
};

export interface QuickActionsMenuProps {
    planCode?: string;
    policyNumber?: string;
    eligibilityCheck?: {
        eligibleAutopay: boolean | null;
        eligiblePremium: boolean | null;
        eligibleWithdrawal: boolean | null;
        eligibleFreeLookCancel: boolean;
    };
    isLoading?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const QuickActionsMenu = ({ planCode, policyNumber, eligibilityCheck, isLoading, onOpenChange }: QuickActionsMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'quickActions',
    });

    return (
        <>
            {/* medium and larger viewports */}
            <div className="hidden md:block">
                <MenuContextual trigger={<TextButton t={t} />} onOpenChange={onOpenChange}>
                    <MenuContextualContent
                        planCode={planCode}
                        policyNumber={policyNumber}
                        t={t}
                        eligibilityCheck={eligibilityCheck}
                        isLoading={isLoading}
                    />
                </MenuContextual>
            </div>

            {/* small viewports */}
            <div className="md:hidden">
                <ReactTooltip.Provider>
                    <ReactTooltip.Root>
                        <MenuContextual trigger={<IconButton t={t} />} triggerAsChild={true} onOpenChange={onOpenChange}>
                            <MenuContextualContent
                                planCode={planCode}
                                policyNumber={policyNumber}
                                t={t}
                                eligibilityCheck={eligibilityCheck}
                            />
                        </MenuContextual>
                        <ReactTooltip.Portal>
                            <ReactTooltip.Content align="end" className="z-20 my-0.5" side="top">
                                <div className={commonPopoverClasses}>
                                    <span className="body-sm">{t('label')}</span>
                                </div>
                            </ReactTooltip.Content>
                        </ReactTooltip.Portal>
                    </ReactTooltip.Root>
                </ReactTooltip.Provider>
            </div>
        </>
    );
};

export default QuickActionsMenu;
