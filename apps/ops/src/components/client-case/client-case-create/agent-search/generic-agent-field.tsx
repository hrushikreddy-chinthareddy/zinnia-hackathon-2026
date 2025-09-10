import { useState } from 'react';

import { AgentFieldLabel } from './agent-field-label';
import { AgentInactiveField } from './agent-inactive-field';
import { AgentSearchField } from './agent-search-field';
import styles from './agent-search.module.css';

type GenericAgentFieldProps = {
    editable: boolean;
};

export const GenericAgentField = ({ editable }: GenericAgentFieldProps) => {
    const [state, setState] = useState<'INACTIVE' | 'SEARCH'>('INACTIVE');

    return (
        <div>
            <AgentFieldLabel />

            <div className={styles.agentFieldContainer}>
                {state === 'INACTIVE' && (
                    <AgentInactiveField
                        editable={editable}
                        onEdit={() => setState('SEARCH')}
                    />
                )}
                {state === 'SEARCH' && (
                    <AgentSearchField onCancel={() => setState('INACTIVE')} />
                )}
            </div>
        </div>
    );
};
