import { default as styles } from './CardSection.module.css';

type CardSectionProps = {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};

const CardSection = ({ children, title, action }: CardSectionProps) => {
  return (
    <div className="card-section">
      <div className={styles.header}>
        <h2 className="typography-desktop-headline-2-d">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
};

export default CardSection;
