import { Policy } from '@xd/api-types/dist/generated-types/sor';
import { Icon, IconType } from '@zinnia/bloom/components';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';

import CorrespondenceError from './error';

type ConfirmProps = { letterType: string; policy: Policy; hasError: boolean };

const Confirm = ({ letterType, policy, hasError }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    if (hasError) {
        return <CorrespondenceError policy={policy} />;
    }

    return (
        <CardInfo
            className="py-8"
            cta={{
                action: () => {
                    router.push(
                        `/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`
                    );
                },
                text: t('transactions.states.success.title'),
            }}
            icon={
                <Icon
                    type={IconType.CIRCLE_CHECKMARK}
                    height={50}
                    width={50}
                    color="#007B5A"
                />
            }
            subtitle={`${t(
                'contactCenter.sendCorrespondence.confirm.titlePart1'
            )} ${t([
                `contactCenter.sendCorrespondence.letterTypes.${letterType}`,
                letterType,
            ])} ${t('contactCenter.sendCorrespondence.confirm.titlePart2')}`}
            title={t('transactions.states.success.title')}
        />
    );
};

export default Confirm;
