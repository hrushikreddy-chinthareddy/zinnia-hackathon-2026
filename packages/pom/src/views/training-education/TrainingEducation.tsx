import CardSection from '../../components/card-section/CardSection';
import AmlTraining from './aml-training/AmlTraining';
import ProductTraining from './product-training/ProductTraining';
import StateTraining from './state-training/StateTraining';

const TrainingEducation = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--measure-dimension-margin-xl)',
      }}
    >
      <CardSection
        title="AML Training"
        action={() => console.log('clicked aml training')}
      >
        <AmlTraining />
      </CardSection>
      <CardSection
        title="Product Training"
        action={() => console.log('clicked product training')}
      >
        <ProductTraining />
      </CardSection>
      <CardSection
        title="State Training"
        action={() => console.log('clicked state training')}
      >
        <StateTraining />
      </CardSection>
    </div>
  );
};

export default TrainingEducation;
