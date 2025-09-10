import IconButton from '@deps/components/icon-button/icon-button';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { useAgentFieldContext } from './agent-field-context';
import styles from './agent-search.module.css';

type AgentInactiveFieldProps = {
    editable?: boolean;
    onEdit?: () => void;
};

export const AgentInactiveField = ({
    editable = true,
    onEdit,
}: AgentInactiveFieldProps) => {
    const { agentDetails } = useAgentFieldContext();
    const { firstName, lastName, email } = agentDetails ?? {};
    const agentName =
        firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName;

    return (
        <div className={styles.agentReadStateContainer}>
            <div className={styles.agentInfo}>
                <Typography variant={TypographyVariant.BodySm}>
                    {agentName || DEFAULT_ERROR_STRING}
                </Typography>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.agentEmail}
                >
                    {email || ''}
                </Typography>
            </div>
            {editable && (
                <IconButton onClick={onEdit}>
                    <EditIcon
                        color="blue"
                        height={'20px'}
                        width={'20px'}
                        className={styles.editIcon}
                    />
                </IconButton>
            )}
        </div>
    );
};
