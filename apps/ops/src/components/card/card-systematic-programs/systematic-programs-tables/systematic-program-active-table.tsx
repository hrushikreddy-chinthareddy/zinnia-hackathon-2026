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

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    DEFAULT_ERROR_STRING,
    DEFAULT_EXTENDED_DATE_FORMAT,
} from '@deps/types/constants';

import FooterAction from '../../card-footer-action/card-footer.action';
import {
    arrangmentTypesDictionary,
    arrangmentTypesMsgDictionary,
    frequencyDictionary,
    paymentFormDictionary,
    SystematicProgramsActiveTableProps,
} from '../card-systematic-programs.types';
import styles from '../systematic-programs-table.module.css';

const SystematicProgramsActiveTable = ({
    programs,
    hasActivePrograms,
}: SystematicProgramsActiveTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.systematicPrograms',
    });
    const getEmptyLabel = () => {
        if (programs.length === 0) return '';
        if (programs.length === 1)
            return arrangmentTypesMsgDictionary[programs[0].arrangementType];
        if (programs.length === 2)
            return `${
                arrangmentTypesMsgDictionary[programs[0].arrangementType]
            } or ${arrangmentTypesMsgDictionary[programs[1].arrangementType]}`;
        return '';
    };
    return (
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
                            details={t('paymentAmount') as string}
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
                            details={t('nextPayment') as string}
                            variant={ContentVariant.BodyBold}
                        />
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.paymentTypeCell}>
                        <Content
                            details={t('paymentType') as string}
                            variant={ContentVariant.BodyBold}
                        />
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Content
                            details={t('actions') as string}
                            variant={ContentVariant.BodyBold}
                        />
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
                                                <Content
                                                    details={
                                                        program.arrangementType
                                                            ? arrangmentTypesDictionary[
                                                                  program
                                                                      .arrangementType
                                                              ]
                                                            : DEFAULT_ERROR_STRING
                                                    }
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell
                                                className={
                                                    styles.paymentAmountCell
                                                }
                                            >
                                                <Content
                                                    details={amount}
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={styles.frecuencyCell}
                                            >
                                                <Content
                                                    details={
                                                        activeProgram.frequency
                                                            ? frequencyDictionary[
                                                                  activeProgram
                                                                      .frequency
                                                              ]
                                                            : DEFAULT_ERROR_STRING
                                                    }
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    styles.nextPaymentCell
                                                }
                                            >
                                                <Content
                                                    details={date}
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    styles.paymentTypeCell
                                                }
                                            >
                                                <Content
                                                    details={
                                                        paymentType
                                                            ? paymentFormDictionary[
                                                                  paymentType
                                                              ]
                                                            : DEFAULT_ERROR_STRING
                                                    }
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell
                                                className={styles.actionCell}
                                            >
                                                {program.manageAction && (
                                                    <FooterAction
                                                        footerContent={{
                                                            ...program.manageAction,
                                                            text: t('manage'),
                                                        }}
                                                    />
                                                )}
                                                {program.cancelAction && (
                                                    <FooterAction
                                                        footerContent={{
                                                            ...program.cancelAction,
                                                            text: t('cancel'),
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
                                    <Content
                                        details={`There are currently no ${getEmptyLabel()} systematic programs.`}
                                        variant={ContentVariant.BodySm}
                                    />
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
