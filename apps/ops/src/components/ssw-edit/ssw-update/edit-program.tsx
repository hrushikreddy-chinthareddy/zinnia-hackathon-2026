import { Icon, IconType } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import IconButton from '@deps/components/icon-button/icon-button';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { ChannelType } from '@deps/models/case/enums';

import { signaturesConfig } from '../bank-update/bank-update.helper';
import { SswUpdateType } from '../ssw-edit-helper';

const channelOptions = (t: TFunction) => [
    {
        label: t('sswUpdate.channelOptions.emailFaxMail'),
        value: ChannelType.Email,
    },
    {
        label: t('sswUpdate.channelOptions.phone'),
        value: ChannelType.Phone,
    },
];
const EditProgram = ({ program, onTerminate, onEdit }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { formSource, setFormSource, formSignature } = useContext(FormDataContext);
    return (
        <div>
            <div className="mx-8">
                <div className="my-4 grid w-full grid-cols-4 gap-4">
                    <SelectSimple
                        disabled={false}
                        className="max-w-lg"
                        label={t('sswUpdate.channel') || ''}
                        options={channelOptions(t)}
                        onChange={val => setFormSource(prevState => ({ ...prevState, channel: { text: val } }))}
                        size={FieldSize.Small}
                        value={formSource.channel?.text ? formSource.channel?.text : ChannelType.Phone}
                        name="channel"
                    />
                </div>
                <div key={program.allocationId + 'in'} className="flex">
                    <div className="my-2 grid grid-cols-auto-2 gap-2">
                        <Program program={program} isFormStateReadOnly={false} />
                    </div>
                    <div className="mt-2 p-8 text-primary flex">
                        <IconButton className="mx-2 " aria-describedby="edit-program" onClick={() => onEdit(true)}>
                            <Icon type={IconType.EDIT_ALT} height={20} width={20} />
                        </IconButton>
                        <IconButton
                            className="mx-2"
                            aria-describedby="delete-program"
                            onClick={() => onTerminate(program, SswUpdateType.PROGRAM_TERMINATE)}
                        >
                            <Icon type={IconType.TRASH} height={20} width={20} />
                        </IconButton>
                    </div>
                </div>
            </div>

            {formSource.channel.text === ChannelType.Email && formSignature && (
                <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
            )}
        </div>
    );
};

export default EditProgram;
