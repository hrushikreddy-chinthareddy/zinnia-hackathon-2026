import { Label } from '@zinnia/bloom/components';

import { CallLog } from "./claims.type";
import styles from '../../../../../components/dynamic-form/components/text-field/text-field.module.css';

export const DisplayCompletedCalls = ({ task }: { task: any }) => {
  const dynamicKey = task?.data?.details?.beneCall ? 'beneCall' : 'benefinalcontactattempt';
  const callLogs = task?.data?.details?.[dynamicKey]?.callLogs || [];
  const completedCalls = callLogs.filter((log: CallLog) => log.callDone === true && typeof log.callSequence === 'number');

  const sortedCalls = [...completedCalls].sort((a: CallLog, b: CallLog) => a.callSequence - b.callSequence);

  return (
    <>
      {sortedCalls.length > 0 &&
        sortedCalls.map((log: CallLog, index: number) => (
          <div key={`call-${log.callSequence}`} className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Call #{log.callSequence}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label labelFor={`role-${index}`}>Contact Role</Label>
                <div className={styles.textField}>
                  {log.partyRoleCategory === 'AGENT'
                    ? 'Agent'
                    : log.partyRole === 'PRIMARYBENEFICIARY'
                      ? 'Beneficiary'
                      : 'Other'}
                </div>
              </div>
              <div>
                <Label labelFor={`name-${index}`}>Name</Label>
                <div className={styles.textField}>{log.fullName}</div>
              </div>
              <div>
                <Label labelFor={`phone-${index}`}>Phone</Label>
                <div className={styles.textField}>
                  {log.phone ? `+${log.phone.countryCode} (${log.phone.areaCode}) ${log.phone.dialNumber}` : ''}
                </div>
              </div>
              <div>
                <Label labelFor={`relationship-${index}`}>Relationship to insured</Label>
                <div className={styles.textField}>{log.relationshipToInsured}</div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};