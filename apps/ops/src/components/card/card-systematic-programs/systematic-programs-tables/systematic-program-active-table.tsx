import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { ArrangementType } from '@zinnia/api-types/types/bpm';

import FooterAction from '../../card-footer-action/card-footer-action';
import { SystematicProgramsActiveTableProps } from '../card-systematic-programs.types';
import styles from '../systematic-programs-table.module.css';

const SystematicProgramsActiveTable = ({
    programs,
    hasActivePrograms,
    isLife,
}: SystematicProgramsActiveTableProps) => {
    const { t } = useTranslation();
    const getEmptyLabel = () => {
        if (programs.length === 0) return '';
        if (programs.length === 1 || isLife)
            return t(programs[0].arrangementType).toLowerCase();
        if (programs.length === 2)
            return `${t(programs[0].arrangementType).toLowerCase()} ${t(
                'or'
            )} ${
                programs[1].arrangementType ===
                ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                    ? 'RMD'
                    : t(programs[1].arrangementType).toLowerCase()
            }`;
        return '';
    };
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell className={styles.typeCell}>
                        {t('allFields.type')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.paymentAmountCell}>
                        {t('allFields.paymentAmount')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.frecuencyCell}>
                        {t('allFields.frequency')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.nextPaymentCell}>
                        {t('allFields.nextPayment')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('allFields.paymentType')}
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.actionCell}>
                        {t('allFields.actions')}
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            {
                <TableBody>
                    {hasActivePrograms ? (
                        programs?.flatMap((program) =>
                            program.activePrograms.map(
                                (activeProgram, index) => {
                                    const date = dayjs(
                                        activeProgram.nextProgramDate
                                    ).format(DEFAULT_EXTENDED_DATE_FORMAT);
                                    const amount = numberFormatify(
                                        activeProgram.amount,
                                        {
                                            style: 'currency',
                                            currency: 'USD',
                                        }
                                    );
                                    const paymentType =
                                        activeProgram?.party?.[0].paymentForm;

                                    return (
                                        <TableRow
                                            key={`program-${activeProgram.arrangementId}-${index}`}
                                        >
                                            <TableCell
                                                className={styles.typeCell}
                                            >
                                                {program.arrangementType
                                                    ? t(
                                                          `enums.${program.arrangementType}`
                                                      )
                                                    : DEFAULT_ERROR_STRING}
                                            </TableCell>

                                            <TableCell
                                                className={
                                                    styles.paymentAmountCell
                                                }
                                            >
                                                {amount}
                                            </TableCell>
                                            <TableCell
                                                className={styles.frecuencyCell}
                                            >
                                                {activeProgram.frequency
                                                    ? t(
                                                          `enums.${activeProgram.frequency}`
                                                      )
                                                    : DEFAULT_ERROR_STRING}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    styles.nextPaymentCell
                                                }
                                            >
                                                {date}
                                            </TableCell>
                                            <TableCell>
                                                {paymentType
                                                    ? t(`enums.${paymentType}`)
                                                    : DEFAULT_ERROR_STRING}
                                            </TableCell>
                                            <TableCell
                                                className={styles.actionCell}
                                            >
                                                {program.manageAction && (
                                                    <FooterAction
                                                        footerContent={{
                                                            ...program.manageAction,
                                                            text: t(
                                                                'allFields.manage'
                                                            ),
                                                        }}
                                                    />
                                                )}
                                                {program.cancelAction && (
                                                    <FooterAction
                                                        footerContent={{
                                                            ...program.cancelAction,
                                                            text: t(
                                                                'allFields.cancel'
                                                            ),
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )
                        )
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className={styles.emptyTableCell}>
                                    {t(
                                        'allFields.emptySystematicProgramsTable',
                                        {
                                            type: getEmptyLabel(),
                                        }
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            }
        </Table>
    );
};
export default SystematicProgramsActiveTable;
