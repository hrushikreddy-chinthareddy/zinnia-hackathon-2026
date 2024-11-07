import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Processes } from '@deps/models/case/case';

const INITIAL_FORM_DATA: any = {
    caseId: undefined,
    businessKey: undefined,
    isPrimaryBeneInfoOnFile: false,
    isContingentBeneInfoOnFile: false,
};

// const channelOptions = (t: TFunction) => [
//     {
//         label: t('channelOptions.emailFaxMail'),
//         value: ChannelType.Email,
//     },
//     {
//         label: t('channelOptions.phone'),
//         value: ChannelType.Phone,
//     },
// ];

const Start = ({ policy }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'sswUpdate.tabs.start' });
    // const { formSource, setFormSource } = useContext(FormDataContext);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    return (
        <>
            {/* <div className="my-4 grid w-full grid-cols-4 gap-4">
                <SelectSimple
                    disabled={false}
                    className="max-w-lg"
                    label={t('channel') || ''}
                    options={channelOptions(t)}
                    onChange={val => setFormSource(prevState => ({ ...prevState, channel: { text: val } }))}
                    size={FieldSize.Small}
                    value={formSource.channel?.text ? formSource.channel?.text : ChannelType.Phone}
                    name="channel"
                />
            </div> */}
            <StartStep
                parentPage={ParentPage.CreateCase}
                policy={policy}
                setState={setFormData as StartStepSetState}
                state={formData}
                title={t('title')}
                subtitle={t('subTitle')}
                processType={Processes.SSW}
            />
        </>
    );
};

export default Start;
