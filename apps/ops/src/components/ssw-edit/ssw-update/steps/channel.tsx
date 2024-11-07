import { TFunction, useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SelectSimple from '@deps/components/select/select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { ChannelType } from '@deps/models/case/enums';

import { signaturesConfig } from '../../bank-update/bank-update.helper';

const channelOptions = (t: TFunction) => [
    {
        label: t('channelOptions.emailFaxMail'),
        value: ChannelType.Email,
    },
    {
        label: t('channelOptions.phone'),
        value: ChannelType.Phone,
    },
];

const ChannelStep = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate.tabs.channel' });

    const { formSource, setFormSource } = useContext(FormDataContext);
    const { goToNext } = useWorkflow();

    return (
        <WorkflowCard
            title={t('channel')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={() => goToNext()}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <div className="my-1 mx-8 grid w-full grid-cols-3 gap-4">
                <SelectSimple
                    disabled={false}
                    className="max-w-lg"
                    // label={t('channel') || ''}
                    options={channelOptions(t)}
                    onChange={val => setFormSource(prevState => ({ ...prevState, channel: { text: val } }))}
                    size={FieldSize.Small}
                    value={formSource.channel?.text ? formSource.channel?.text : ChannelType.Phone}
                    name="channel"
                />
            </div>
            <div>
                {formSource.channel.text === ChannelType.Email && (
                    <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
                )}
            </div>
        </WorkflowCard>
    );
};

export default ChannelStep;
