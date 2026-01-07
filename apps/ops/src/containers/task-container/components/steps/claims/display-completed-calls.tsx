import Content, { ContentVariant } from '@deps/components/content/content';
import Field, { FieldVariant } from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import { formatPhone } from '@deps/helpers/string.helpers';
import { NOOP } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { CallLog, ContactRole, DynamicKey } from './claims.type';

export const DisplayCompletedCalls = ({
    task,
    t,
    changeRequire,
}: {
    task: any;
    t: any;
    changeRequire: boolean;
}) => {
    const dynamicKey = task?.data?.details?.beneCall
        ? DynamicKey.BENE_CALL
        : DynamicKey.BENE_FINAL_CONTACT_ATTEMPT;
    const callLogs = task?.data?.details?.[dynamicKey]?.callLogs || [];
    const completedCalls = callLogs.filter(
        (log: CallLog) =>
            log.callDone === true && typeof log.callSequence === 'number'
    );

    const sortedCalls = [...completedCalls].sort(
        (a: CallLog, b: CallLog) => a.callSequence - b.callSequence
    );

    return (
        <>
            {sortedCalls.length > 0 &&
                sortedCalls.map((log: CallLog, index: number) => (
                    <div
                        key={`call-${log.callSequence}`}
                        className="mb-6 pb-6 border-b border-gray-200"
                    >
                        <h3 className="font-medium text-gray-700 mb-3">
                            Call #{log.callSequence}
                        </h3>
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <Field
                                    id={`role-${index}`}
                                    onChange={NOOP}
                                    disabled={true}
                                    placeholder={t('contactRole') as string}
                                    variant={FieldVariant.Inactive}
                                    value={
                                        log.partyRoleCategory ===
                                        ContactRole.AGENT
                                            ? 'Agent'
                                            : log.partyRole ===
                                              ContactRole.PRIMARYBENEFICIARY
                                            ? 'Beneficiary'
                                            : 'Other'
                                    }
                                    label={t('contactRole') as string}
                                    className="w-full h-10 p-2"
                                />
                            </div>
                            <div>
                                <Field
                                    disabled={true}
                                    id={`name-${index}`}
                                    onChange={NOOP}
                                    variant={FieldVariant.Inactive}
                                    placeholder={t('name') as string}
                                    value={log.fullName}
                                    label={t('name') as string}
                                    className="w-full h-10 p-2"
                                />
                            </div>
                            <div>
                                <Field
                                    disabled={true}
                                    id={`phone-${index}`}
                                    onChange={NOOP}
                                    variant={FieldVariant.Inactive}
                                    placeholder={t('phone') as string}
                                    value={formatPhone(log.phone)}
                                    label={t('phone') as string}
                                    className="w-full h-10 p-2"
                                />
                            </div>
                            <div>
                                <Field
                                    disabled={true}
                                    id={`callOutcome-${index}`}
                                    onChange={NOOP}
                                    variant={FieldVariant.Inactive}
                                    placeholder={t('callOutcome') as string}
                                    value={
                                        index === sortedCalls.length - 1 &&
                                        changeRequire
                                            ? t('changeRecorded')
                                            : t('noChangeRecorded')
                                    }
                                    label={t('callOutcome') as string}
                                    className="w-full h-10 p-2"
                                />
                            </div>
                            {log.partyRoleCategory === ContactRole.OTHER && (
                                <div>
                                    <Field
                                        disabled={true}
                                        id={`relationship-${index}`}
                                        onChange={NOOP}
                                        variant={FieldVariant.Inactive}
                                        placeholder={
                                            t('relationshipToOwner') as string
                                        }
                                        value={log.relationshipToInsured}
                                        label={
                                            t('relationshipToOwner') as string
                                        }
                                        className="w-full h-10 p-2"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex w-full flex-col justify-between flex-row mt-4">
                            <FieldLabel
                                variant={FieldVariant.Inactive}
                                label={t('callSummary') as string}
                            />
                            <Content
                                variant={ContentVariant.BodySm}
                                className="text-gray-600"
                                details={log.callSummary}
                                pii={true}
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <div>
                                <FieldLabel
                                    variant={FieldVariant.Inactive}
                                    label={t('contactEstablished') as string}
                                />
                                <Content
                                    variant={ContentVariant.BodySm}
                                    className="text-gray-600"
                                    details={
                                        log.contactEstablished === true
                                            ? 'Yes'
                                            : log.contactEstablished === false
                                            ? 'No'
                                            : DEFAULT_ERROR_STRING
                                    }
                                    pii={true}
                                />
                            </div>
                        </div>
                    </div>
                ))}
        </>
    );
};
