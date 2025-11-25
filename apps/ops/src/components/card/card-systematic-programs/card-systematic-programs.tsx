import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import {
    SystematicProgramsCardProps,
    SystematicProgramsCardTest,
    arrangmentTypesMsgDictionary,
} from './card-systematic-programs.types';
import styles from './systematic-programs-table.module.css';
import FooterAction from '../card-footer-action/card-footer.action';
import CardSection from '../card-section/card-section';
import SystematicProgramsActiveTable from './systematic-programs-tables/systematic-program-active-table';
import SystematicProgramsTerminatedTable from './systematic-programs-tables/systematic-program-terminated-table';

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
            return arrangmentTypesMsgDictionary[programs[0].arrangementType];
        if (programs.length === 2)
            return `${
                arrangmentTypesMsgDictionary[programs[0].arrangementType]
            } or ${arrangmentTypesMsgDictionary[programs[1].arrangementType]}`;
        return '';
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
                        variant={
                            hasTerminatedOrSuspendedPrograms
                                ? ToggleVariant.Default
                                : ToggleVariant.Inactive
                        }
                        data-testid="show-history-toggle"
                        classes={
                            showTerminatedOrSuspended
                                ? styles.toggle
                                : styles.toggleInactive
                        }
                    />
                </div>
            }
        >
            <div className={styles.systematicPrograms}>
                <SystematicProgramsActiveTable
                    programs={programs}
                    hasActivePrograms={hasActivePrograms}
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
