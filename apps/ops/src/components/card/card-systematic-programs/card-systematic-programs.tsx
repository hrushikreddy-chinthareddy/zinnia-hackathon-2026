import { Toggle } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import {
    SystematicProgramsCardProps,
    SystematicProgramsCardTest,
} from './card-systematic-programs.types';
import styles from './systematic-programs-table.module.css';
import FooterAction from '../card-footer-action/card-footer-action';
import CardSection from '../card-section/card-section';
import SystematicProgramsActiveTable from './systematic-programs-tables/systematic-program-active-table';
import SystematicProgramsTerminatedTable from './systematic-programs-tables/systematic-program-terminated-table';

const SystematicProgramsCard = ({
    programs,
    setUpAction,
    isLife,
}: SystematicProgramsCardProps) => {
    const { t } = useTranslation();
    const [showTerminatedOrSuspended, setShowTerminatedOrSuspended] =
        useState(false);

    const handleToggle = () => {
        setShowTerminatedOrSuspended(
            (prevTerminatedOrSuspended) => !prevTerminatedOrSuspended
        );
    };

    const hasActivePrograms = programs.some(
        (program) => program.activePrograms.length > 0
    );
    const hasTerminatedOrSuspendedPrograms = programs.some(
        (program) => program.terminatedOrSuspendedPrograms.length > 0
    );

    const label = t('allFields.showHistory') || 'Show history';

    return (
        <CardSection
            data-testid={SystematicProgramsCardTest.CONTAINER}
            headerClassName={styles.header}
            headerContent={
                <div className={styles.header}>
                    <div className={styles.setUp}>
                        <Typography variant={TypographyVariant.H2}>
                            {t('allFields.systematicPrograms')}
                        </Typography>

                        {setUpAction && (
                            <FooterAction
                                footerContent={{
                                    ...setUpAction,
                                    text: `+ ${t('allFields.setUp')}`,
                                }}
                            />
                        )}
                    </div>
                    <Toggle
                        labelId="show-history-toggle"
                        text={label}
                        onClick={handleToggle}
                        pressed={showTerminatedOrSuspended}
                        data-testid="show-history-toggle"
                        isDisabled={!hasTerminatedOrSuspendedPrograms}
                    />
                </div>
            }
        >
            <div className={styles.systematicPrograms}>
                <SystematicProgramsActiveTable
                    programs={programs}
                    hasActivePrograms={hasActivePrograms}
                    isLife={isLife}
                />
                <SystematicProgramsTerminatedTable
                    programs={programs}
                    hasTerminatedOrSuspendedPrograms={
                        hasTerminatedOrSuspendedPrograms
                    }
                    showTerminatedOrSuspended={showTerminatedOrSuspended}
                />
            </div>
        </CardSection>
    );
};

export default SystematicProgramsCard;
