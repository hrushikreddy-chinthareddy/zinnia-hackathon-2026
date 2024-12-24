import router from 'next/router';
import { useTranslation } from 'next-i18next';

import { useCorrespondence } from '@deps/contexts/CorrespondenceContext';
import { CommunicationTypes } from '@deps/models/case/send-document';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import CardInfo from '../card/card-info/card-info';
import { PiiWrapper } from '../pii/PiiWrapper';

type ConfirmProps = {
    shouldShowCaseButton: FeatureFlags;
    formNames?: string[];
};
const Confirm = ({ shouldShowCaseButton, formNames }: ConfirmProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const { state } = useCorrespondence();
    const source = state?.correspondence?.recipient;
    const ccList = state?.correspondence?.ccList || [];
    const communicationType = state?.correspondence?.type;

    const address = state?.correspondence?.mailDetails;

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                cta={
                    shouldShowCaseButton
                        ? {
                              action: () => {
                                  router.push(`/cases/${state.confirm.caseId}`);
                              },
                              text: t('confirm.cta'),
                          }
                        : undefined
                }
                icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                subtitle={
                    <>
                        {t('confirm.subtitle.0')}
                        <span className="font-bold"> {formNames?.map(formName => (formName ? formName : '')).join(', ')} </span>
                        {[CommunicationTypes.Email, CommunicationTypes.Fax].includes(communicationType as CommunicationTypes) && (
                            <PiiWrapper>
                                <span>{t(`confirm.channel.${communicationType.toLowerCase()}`)}</span>
                                <span className="font-bold"> {source}</span>
                            </PiiWrapper>
                        )}

                        {communicationType === CommunicationTypes.Email && ccList?.length > 0 && (
                            <PiiWrapper>
                                <span className="font-bold"> {ccList?.map(cc => (cc ? cc : '')).join(', ')}</span>
                            </PiiWrapper>
                        )}
                        {communicationType === CommunicationTypes.Mail && address && (
                            <>
                                <PiiWrapper>
                                    <span>{t(`confirm.channel.${communicationType.toLowerCase()}`)}</span>{' '}
                                    <span className="font-bold">
                                        {address?.addressLine1} {address?.addressLine2} {address?.addressLine3} {address?.city}{' '}
                                        {address?.zipCode?.substring(0, 5)}-{address?.zipCode?.substring(5, 9)}
                                    </span>
                                </PiiWrapper>
                            </>
                        )}
                    </>
                }
                title={t('confirm.title')}
            />
        </div>
    );
};

export default Confirm;
