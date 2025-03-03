import CardSection from '../../components/card-section/CardSection';
import AmlTraining from './aml-training/AmlTraining';
import ProductTraining from './product-training/ProductTraining';
import StateTraining from './state-training/StateTraining';
import { AddAmlTrainingSidesheet } from './aml-training/add/AddAmlTrainingSidesheet';
import { AddProductTrainingSidesheet } from './product-training/add/AddProductTrainingSidesheet';
import { AddStateTrainingSidesheet } from './state-training/add/AddStateTrainingSidesheet';

const TrainingEducation = () => {
  return (
    <div className="pom_flex-column">
      <CardSection title="AML Training" action={<AddAmlTrainingSidesheet />}>
        <AmlTraining />
      </CardSection>
      <CardSection
        title="Product Training"
        action={<AddProductTrainingSidesheet />}
      >
        <ProductTraining />
      </CardSection>
      <CardSection
        title="State Training"
        action={<AddStateTrainingSidesheet />}
      >
        <StateTraining />
      </CardSection>
    </div>
  );
};

export default TrainingEducation;
