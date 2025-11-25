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

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';
import {
    DEFAULT_ERROR_STRING,
    DEFAULT_EXTENDED_DATE_FORMAT,
} from '@deps/types/constants';

import {
    arrangmentTypesDictionary,
    frequencyDictionary,
    programStatusDictionary,
    SystematicProgramsTerminatedTableProps,
} from '../card-systematic-programs.types';
import styles from '../systematic-programs-table.module.css';

const SystematicProgramsTerminatedTable = ({
    programs,
    showTerminatedOrSuspended,
}: SystematicProgramsTerminatedTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.systematicPrograms',
    });
    const hasTerminatedOrSuspendedPrograms = programs.some(
        (program) => program.terminatedOrSuspendedPrograms.length > 0
    );

    return hasTerminatedOrSuspendedPrograms && showTerminatedOrSuspended ? (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell className={styles.typeCell}>
                        <Content
                            details={t('type') as string}
                            variant={ContentVariant.BodyBold}
                        />
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.paymentAmountCell}>
                        <Content
                            details={t('lastPaymentDate') as string}
                            variant={ContentVariant.BodyBold}
                        />
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.frecuencyCell}>
                        <div className={styles.tableHeaderContainer}>
                            <Content
                                details={t('frequency') as string}
                                variant={ContentVariant.BodyBold}
                            />
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.nextPaymentCell}>
                        <Content
                            details={t('status') as string}
                            variant={ContentVariant.BodyBold}
                        />
                    </TableHeaderCell>

                    <TableHeaderCell>
                        <Content
                            details={t('terminationDate') as string}
                            variant={ContentVariant.BodyBold}
                        />
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
                                        <Content
                                            details={
                                                program.arrangementType
                                                    ? arrangmentTypesDictionary[
                                                          program
                                                              .arrangementType
                                                      ]
                                                    : DEFAULT_ERROR_STRING
                                            }
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>

                                    <TableCell
                                        className={styles.paymentAmountCell}
                                    >
                                        <Content
                                            details={lastPaymentDate}
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    <TableCell className={styles.frecuencyCell}>
                                        <Content
                                            details={
                                                tosProgram.frequency
                                                    ? frequencyDictionary[
                                                          tosProgram.frequency
                                                      ]
                                                    : DEFAULT_ERROR_STRING
                                            }
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    <TableCell className={styles.statusCell}>
                                        <Icon
                                            type={IconType.HEX_EXCLAMATION}
                                            color="var(--status-text-status-error-text, #db004f)"
                                            width={16}
                                            height={16}
                                        />
                                        <Content
                                            details={
                                                tosProgram.status
                                                    ? programStatusDictionary[
                                                          tosProgram.status
                                                      ]
                                                    : DEFAULT_ERROR_STRING
                                            }
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Content
                                            details={lastPaymentDate}
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
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
