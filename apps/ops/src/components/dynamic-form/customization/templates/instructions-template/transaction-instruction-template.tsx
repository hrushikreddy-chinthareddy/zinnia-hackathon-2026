import { ObjectFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import { Transaction } from '../array-field-template/TransactionsArrayFieldTemplate';
function TransactionInstructionTemplate(props: ObjectFieldTemplateProps) {
    const { title, formContext } = props;
    const transactions =
        formContext.customData.task.data.details?.uncashTransaction
            ?.transactions ?? [];

    const hasPostFund = transactions.some(
        (item: Transaction) => item?.postFund === true
    );
    const hasPreFund = transactions.some(
        (item: Transaction) => item?.postFund === false
    );
    const hasReview = transactions.some(
        (item: Transaction) => item?.postFund == null
    );

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'reverseTransaction',
    });
    const descriptionText = () => {
        if (hasPostFund && hasPreFund) {
            return `${t('postFundTransactionsInstruction')}${t(
                'preFundTransactionsInstruction'
            )}`;
        }
        if (hasPostFund) {
            return `${t('postFundTransactionsInstruction')}`;
        }
        if (hasPreFund) {
            return `${t('preFundTransactionsInstruction')}`;
        }
        if (hasReview) {
            return `${t('reviewFundsInstruction')}`;
        }
        return '';
    };
    return (
        <div
            className={clsx(
                'responsive-padding flex grow flex-col gap-2 bg-gray-50 my-4'
            )}
        >
            <div className="flex flex-col gap-2">
                {title && (
                    <Typography
                        data-testid="workflow-card-title"
                        variant={TypographyVariant.BodyBold}
                    >
                        {title}
                    </Typography>
                )}

                <Typography variant={TypographyVariant.Body}>
                    {descriptionText()}
                </Typography>
            </div>
        </div>
    );
}

export default TransactionInstructionTemplate;
