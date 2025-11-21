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
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

import {
    arrangmentTypesDictionary,
    SystematicProgramsCardProps,
    frequencyDictionary,
    paymentFormDictionary,
    programStatusDictionary,
    SystematicProgramsCardTest,
} from './card-systematic-programs.types';
import styles from './systematic-programs-table.module.css';
import FooterAction from '../card-footer-action/card-footer.action';
import CardSection from '../card-section/card-section';

const SystematicProgramsCard = ({
    title,
    programs,
    setUpAction,
}: SystematicProgramsCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.systematicPrograms',
    });
    const [showTerminatedOrSuspended, setShowTerminatedOrSuspended] =
        useState(false);

    const handleToggle = () => {
        setShowTerminatedOrSuspended(!showTerminatedOrSuspended);
    };

    const hasActivePrograms = programs.some(
        (program) => program.activePrograms.length > 0
    );
    const hasTerminatedOrSuspendedPrograms = programs.some(
        (program) => program.terminatedOrSuspendedPrograms.length > 0
    );

    const label = t('showHistory') || 'Show history';

    const getEmptyLabel = () => {
        if (programs.length === 0) return '';
        if (programs.length === 1)
            return arrangmentTypesDictionary[programs[0].arrangementType];
        if (programs.length === 2)
            return `${
                arrangmentTypesDictionary[programs[0].arrangementType]
            } or ${arrangmentTypesDictionary[programs[1].arrangementType]}`;

        const allButLast = programs.slice(0, -1).join(', ');
        const last = programs[programs.length - 1];
        return `${allButLast}, or ${last}`;
    };

    return (
        <CardSection
            data-testid={SystematicProgramsCardTest.CONTAINER}
            headerClassName={styles.header}
            headerContent={
                <div className={styles.header}>
                    <div className={styles.setUp}>
                        <Typography variant={TypographyVariant.H2}>
                            {title}
                        </Typography>

                        {setUpAction && (
                            <FooterAction
                                footerContent={{
                                    ...setUpAction,
                                    text: `+ ${t('setUp')}`,
                                }}
                            />
                        )}
                    </div>
                    <Toggle
                        ariaLabel={label}
                        handleToggle={handleToggle}
                        size={ToggleSize.Default}
                        text={label}
                        value={showTerminatedOrSuspended}
                        variant={ToggleVariant.Default}
                        data-testid="show-history-toggle"
                        classes={
                            showTerminatedOrSuspended
                                ? styles.toggle
                                : undefined
                        }
                    />
                </div>
            }
        >
            <div className={styles.systematicPrograms}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell className={styles.typeCell}>
                                <Content
                                    details={t('type') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                            <TableHeaderCell
                                className={styles.paymentAmountCell}
                            >
                                <Content
                                    details={t('paymentAmount') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                            <TableHeaderCell className={styles.frecuencyCell}>
                                <div className={styles.tableHeaderContainer}>
                                    <Content
                                        details={t('frecuency') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell className={styles.nextPaymentCell}>
                                <Content
                                    details={t('nextPayment') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                            <TableHeaderCell className={styles.paymentTypeCell}>
                                <Content
                                    details={t('paymentType') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <Content
                                    details={t('actions') as string}
                                    variant={ContentVariant.BodySmBold}
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
                                            ).format(
                                                DEFAULT_EXTENDED_DATE_FORMAT
                                            );
                                            const amount = numberFormatify(
                                                activeProgram.amount,
                                                {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                }
                                            );
                                            const paymentType =
                                                activeProgram?.party?.[0]
                                                    .paymentForm;

                                            return (
                                                <TableRow
                                                    key={`program-${activeProgram.arrangementId}-${index}`}
                                                >
                                                    <TableCell
                                                        className={
                                                            styles.typeCell
                                                        }
                                                    >
                                                        <Content
                                                            details={
                                                                program.arrangementType
                                                                    ? arrangmentTypesDictionary[
                                                                          program
                                                                              .arrangementType
                                                                      ]
                                                                    : '--'
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
                                                        className={
                                                            styles.frecuencyCell
                                                        }
                                                    >
                                                        <Content
                                                            details={
                                                                activeProgram.frequency
                                                                    ? frequencyDictionary[
                                                                          activeProgram
                                                                              .frequency
                                                                      ]
                                                                    : '--'
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
                                                                    : '--'
                                                            }
                                                            variant={
                                                                ContentVariant.BodySm
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.actionCell
                                                        }
                                                    >
                                                        {program.manageAction && (
                                                            <FooterAction
                                                                footerContent={{
                                                                    ...program.manageAction,
                                                                    text: t(
                                                                        'manage'
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                        {program.cancelAction && (
                                                            <FooterAction
                                                                footerContent={{
                                                                    ...program.cancelAction,
                                                                    text: t(
                                                                        'cancel'
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
                {hasTerminatedOrSuspendedPrograms &&
                    showTerminatedOrSuspended && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell
                                        className={styles.typeCell}
                                    >
                                        <Content
                                            details={t('type') as string}
                                            variant={ContentVariant.BodySmBold}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        className={styles.paymentAmountCell}
                                    >
                                        <Content
                                            details={
                                                t('lastPaymentDate') as string
                                            }
                                            variant={ContentVariant.BodySmBold}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        className={styles.frecuencyCell}
                                    >
                                        <div
                                            className={
                                                styles.tableHeaderContainer
                                            }
                                        >
                                            <Content
                                                details={
                                                    t('frecuency') as string
                                                }
                                                variant={
                                                    ContentVariant.BodySmBold
                                                }
                                            />
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        className={styles.nextPaymentCell}
                                    >
                                        <Content
                                            details={t('status') as string}
                                            variant={ContentVariant.BodySmBold}
                                        />
                                    </TableHeaderCell>

                                    <TableHeaderCell>
                                        <Content
                                            details={
                                                t('terminationDate') as string
                                            }
                                            variant={ContentVariant.BodySmBold}
                                        />
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {programs.flatMap((program) =>
                                    program.terminatedOrSuspendedPrograms?.map(
                                        (tosProgram, index) => {
                                            const lastPaymentDate =
                                                tosProgram.endDate
                                                    ? dayjs(
                                                          tosProgram.endDate
                                                      ).format(
                                                          DEFAULT_EXTENDED_DATE_FORMAT
                                                      )
                                                    : '--';

                                            return (
                                                <TableRow
                                                    key={`program-${tosProgram.arrangementId}-${index}`}
                                                >
                                                    <TableCell
                                                        className={
                                                            styles.typeCell
                                                        }
                                                    >
                                                        <Content
                                                            details={
                                                                program.arrangementType
                                                                    ? arrangmentTypesDictionary[
                                                                          program
                                                                              .arrangementType
                                                                      ]
                                                                    : '--'
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
                                                            details={
                                                                lastPaymentDate
                                                            }
                                                            variant={
                                                                ContentVariant.BodySm
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.frecuencyCell
                                                        }
                                                    >
                                                        <Content
                                                            details={
                                                                tosProgram.frequency
                                                                    ? frequencyDictionary[
                                                                          tosProgram
                                                                              .frequency
                                                                      ]
                                                                    : '--'
                                                            }
                                                            variant={
                                                                ContentVariant.BodySm
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            styles.statusCell
                                                        }
                                                    >
                                                        <Icon
                                                            type={
                                                                IconType.HEX_EXCLAMATION
                                                            }
                                                            color="var(--status-text-status-error-text, #db004f)"
                                                            width={16}
                                                            height={16}
                                                        />
                                                        <Content
                                                            details={
                                                                tosProgram.status
                                                                    ? programStatusDictionary[
                                                                          tosProgram
                                                                              .status
                                                                      ]
                                                                    : '--'
                                                            }
                                                            variant={
                                                                ContentVariant.BodySm
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Content
                                                            details={
                                                                lastPaymentDate
                                                            }
                                                            variant={
                                                                ContentVariant.BodySm
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )
                                )}
                            </TableBody>
                        </Table>
                    )}
            </div>
        </CardSection>
    );
};

export default SystematicProgramsCard;
