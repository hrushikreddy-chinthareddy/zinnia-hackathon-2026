import {
    Icon,
    IconType,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import {
    DEFAULT_ERROR_STRING,
    DEFAULT_EXTENDED_DATE_FORMAT,
} from '@deps/types/constants';

import { SystematicProgramsTerminatedTableProps } from '../card-systematic-programs.types';
import styles from '../systematic-programs-table.module.css';

const SystematicProgramsTerminatedTable = ({
    programs,
    showTerminatedOrSuspended,
}: SystematicProgramsTerminatedTableProps) => {
    const { t } = useTranslation();
    const hasTerminatedOrSuspendedPrograms = programs.some(
        (program) => program.terminatedOrSuspendedPrograms.length > 0
    );

    return hasTerminatedOrSuspendedPrograms && showTerminatedOrSuspended ? (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell className={styles.typeCell}>
                        {t('allFields.type')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.paymentAmountCell}>
                        {t('allFields.lastPaymentDate')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.frecuencyCell}>
                        {t('allFields.frequency')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.nextPaymentCell}>
                        {t('allFields.systemProgramStatus')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('allFields.terminationDate')}
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                {programs.flatMap((program) =>
                    program.terminatedOrSuspendedPrograms?.map(
                        (tosProgram, index) => {
                            const lastPaymentDate = tosProgram.endDate
                                ? dayjs(tosProgram.endDate).format(
                                      DEFAULT_EXTENDED_DATE_FORMAT
                                  )
                                : DEFAULT_ERROR_STRING;

                            return (
                                <TableRow
                                    key={`program-${tosProgram.arrangementId}-${index}`}
                                >
                                    <TableCell className={styles.typeCell}>
                                        {program.arrangementType
                                            ? t(program.arrangementType)
                                            : DEFAULT_ERROR_STRING}
                                    </TableCell>

                                    <TableCell
                                        className={styles.paymentAmountCell}
                                    >
                                        {lastPaymentDate}
                                    </TableCell>
                                    <TableCell className={styles.frecuencyCell}>
                                        {tosProgram.frequency
                                            ? t(tosProgram.frequency)
                                            : DEFAULT_ERROR_STRING}
                                    </TableCell>
                                    <TableCell className={styles.statusCell}>
                                        <Icon
                                            type={IconType.HEX_EXCLAMATION}
                                            color="var(--status-text-status-error-text, #db004f)"
                                            width={16}
                                            height={16}
                                        />
                                        {tosProgram.status
                                            ? t(tosProgram.status)
                                            : DEFAULT_ERROR_STRING}
                                    </TableCell>
                                    <TableCell>{lastPaymentDate}</TableCell>
                                </TableRow>
                            );
                        }
                    )
                )}
            </TableBody>
        </Table>
    ) : null;
};
export default SystematicProgramsTerminatedTable;
