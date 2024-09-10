import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import classes from './chip-x.module.css';
import Label, { LabelVariant } from '../label/label';

export interface ChipXProps {
    ariaLabel?: string;
    label: string;
    onDelete?: () => void;
}

const ChipX = ({ ariaLabel, label, onDelete }: ChipXProps): JSX.Element => {
    return (
        <div className={classes['bds-chip-x']}>
            <Label label={label} sentenceCase={false} variant={LabelVariant.LabelMd} />
            <button aria-label={ariaLabel} className={classes['bds-chip-x-button']} data-testid='bds-chip-x-button' onClick={onDelete}>
                <CancelIcon height={18} width={18} />
            </button>
        </div>
    );
};

export default ChipX;
