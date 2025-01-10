import { Divider } from '@zinnia/bloom/components';
import { Identification } from '../identification/Identification';
import { ContactInfo } from '../contact-info/ContactInfo';

export const PersonalInfo = () => {
    return (
        <div>
            <Identification />
            <Divider direction="horizontal" />
            <ContactInfo />
        </div>
    );
};
