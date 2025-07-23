import Field, { FieldVariant } from '@deps/components/fields/field';
import { formatPhone } from '@deps/helpers/string.helpers';

import { CallLog, ContactRole } from './claims.type';

export const DisplayCompletedCalls = ({ task, t }: { task: any; t: any }) => {
    const dynamicKey = task?.data?.details?.beneCall
        ? 'beneCall'
        : 'benefinalcontactattempt';
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
                                    onChange={() => {}}
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
                                    onChange={() => {}}
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
                                    onChange={() => {}}
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
                                    onChange={() => {}}
                                    variant={FieldVariant.Inactive}
                                    placeholder={t('callOutcome') as string}
                                    value={t('noChangeRecorded')}
                                    label={t('callOutcome') as string}
                                    className="w-full h-10 p-2"
                                />
                            </div>

                            {log.partyRoleCategory === ContactRole.OTHER && (
                                <div>
                                    <Field
                                        disabled={true}
                                        id={`relationship-${index}`}
                                        onChange={() => {}}
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
                    </div>
                ))}
        </>
    );
};
