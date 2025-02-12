import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { default as styles } from './CardSection.module.css';

type CardSectionProps = {
  children: React.ReactNode;
  title: string;
  action?: () => void;
};

const CardSection = ({ children, title, action }: CardSectionProps) => {
  return (
    <div onClick={action} className="card-section">
      <div className={styles.header}>
        <h2 className="typography-desktop-headline-2-d">{title}</h2>
        {action && (
          <Button size="small" mode="link">
            Add <Icon small type={IconType.ADD} />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};

export default CardSection;
