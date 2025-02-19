import { ContactInfo } from './contact-info/ContactInfo';
import { Identification } from './identification/Identification';
import { ProducerType } from '../../types';
import { BackgroundChecks } from './background-checks/BackgroundChecks';

const EntityInformation = ({
  producerType,
}: {
  producerType: ProducerType;
}) => {
  return (
    <div>
      <Identification producerType={producerType} />
      <ContactInfo producerType={producerType} />
      {producerType === ProducerType.INDIVIDUAL && <BackgroundChecks />}
    </div>
  );
};

export default EntityInformation;
