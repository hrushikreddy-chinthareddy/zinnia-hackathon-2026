import { useQuery } from '@tanstack/react-query';
import {
    Heading,
    HeadingVariant,
    Icon,
    IconType,
    Loader,
} from '@zinnia/bloom/components';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import { Modal } from '@deps/components/modal/modal';
import { PolicyMenuContextualContent } from '@deps/components/quick-actions-menu/quick-actions-menu';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    getPolicyQueryKey,
    getPolicyQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';

interface PolicyActionCellProps {
    policyNumber: string;
    planCode: string;
}

export const PolicyActionCell: FC<PolicyActionCellProps> = ({
    planCode,
    policyNumber,
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'quickActions',
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

    const { data: policyDetails = new PolicyDetails() } = useQuery({
        queryKey: [getPolicyQueryKey, policyNumber, planCode],
        queryFn: () => getPolicyQuery(policyNumber, planCode),
        select: (data) => {
            return new PolicyDetails(data);
        },
        enabled: menuOpen,
    });

    return (
        <MenuContextual
            data-testid="policy-action-cell-menu"
            trigger={<Icon type={IconType.MENU_VERTICAL} />}
            onOpenChange={setMenuOpen}
        >
            <PolicyMenuContextualContent
                policy={policyDetails}
                t={t}
                setIsLoadingModalOpen={setIsLoadingModalOpen}
            />

            {isLoadingModalOpen && (
                <Modal
                    open={isLoadingModalOpen}
                    closeIcon=""
                    onCancel={() => {}}
                    content={
                        <div className="flex flex-col items-center gap-4">
                            <Loader />
                            <Heading as={HeadingVariant.h3}>
                                {t('additionalActions.downloadingPdf')}
                            </Heading>
                        </div>
                    }
                />
            )}
        </MenuContextual>
    );
};
