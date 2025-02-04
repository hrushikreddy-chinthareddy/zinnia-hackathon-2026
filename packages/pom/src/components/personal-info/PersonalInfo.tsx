import { Divider } from '@zinnia/bloom/components';
import { BackgroundCheck } from '../background-check/BackgroundCheck';
import { ContactInfo } from '../contact-info/ContactInfo';
import { Identification } from '../identification/Identification';
import { ProducerType } from '../types';

const PersonalInfo = ({ producerType }: { producerType: ProducerType }) => {
  return (
    <div>
      <Identification producerType={producerType} />
      <Divider direction="horizontal" />
      <ContactInfo producerType={producerType} />
      <Divider direction="horizontal" />
      {producerType === ProducerType.INDIVIDUAL && <BackgroundCheck />}
    </div>
  );
};

export default PersonalInfo;
