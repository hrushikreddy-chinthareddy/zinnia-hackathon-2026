import { RegistryFieldsType } from '@rjsf/utils';

import AutoCompleteField from './autocomplete-field/autocomplete-field';
import ChangeAddressField from './change-address-field/change-address-field';
import DocumentMetadataField from './document-metadata-field/document-metadata-field';
import UUIDField from './uuid-field/uuid-field';

export function generateFields(): RegistryFieldsType {
    return {
        AutoCompleteField,
        ChangeAddressField,
        DocumentMetadataField,
        UUIDField,
    };
}

export default generateFields();
