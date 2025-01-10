import { Divider } from '@zinnia/bloom/components';
import { ContactInfo } from '../contact-info/ContactInfo';
import { Identification } from '../identification/Identification';

export const PersonalInfo = () => {
    return (
        <div>
            <Identification />
            <Divider direction="horizontal" />
            <ContactInfo />
        </div>
    );
};
