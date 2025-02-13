import { ContactInfo } from './contact-info/ContactInfo';
import { Identification } from './identification/Identification';
import { ProducerType } from '../../types';
import { BackgroundCheck } from './background-check/BackgroundCheck';

const EntityInformation = ({
  producerType,
}: {
  producerType: ProducerType;
}) => {
  return (
    <div>
      <Identification producerType={producerType} />
      <ContactInfo producerType={producerType} />
      {producerType === ProducerType.INDIVIDUAL && <BackgroundCheck />}
    </div>
  );
};

export default EntityInformation;
