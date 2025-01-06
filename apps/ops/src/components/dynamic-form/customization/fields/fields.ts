import { RegistryFieldsType } from '@rjsf/utils';

import { InstructionsField } from './instructions-field/instructions-field';

export function generateFields(): RegistryFieldsType {
    return { instructions: InstructionsField };
}

export default generateFields();
