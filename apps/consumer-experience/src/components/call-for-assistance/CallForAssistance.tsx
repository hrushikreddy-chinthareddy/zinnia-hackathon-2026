import { ReactNode } from 'react';

export const CallForAssistance = ({
  callToAction,
  customInstruction,
}: {
  callToAction?: ReactNode;
  customInstruction?: string;
}) => {
  const phone = 18002322222;
  const instructionText = customInstruction || 'to add or make changes';
  return (
    <p
      className="typography-content-body-bold"
      style={{ color: 'var(--Base-Text-text-primary, #212121)' }}
    >
      <span>{callToAction}</span> <span>Call</span>{' '}
      <a href={`tel:+${phone}`} className="typography-nav-links-inline">
        1-800-232-2222
      </a>{' '}
      <span>{instructionText}</span>
    </p>
  );
};
