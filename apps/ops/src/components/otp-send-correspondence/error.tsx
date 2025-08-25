import { Policy } from '@xd/api-types/dist/generated-types/sor';
import { Icon, IconType } from '@zinnia/bloom/components';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';

const CorrespondenceError = ({ policy }: { policy: Policy }) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <CardInfo
            className="py-8"
            cta={{
                action: () => {
                    router.push(
                        `/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`
                    );
                },
                text: t('transactions.states.apiError.secondaryCta'),
            }}
            icon={
                <Icon
                    type={IconType.ALERT_EXCLAMATION}
                    height={50}
                    width={50}
                />
            }
            title={t('transactions.states.apiError.title')}
        />
    );
};

export default CorrespondenceError;
