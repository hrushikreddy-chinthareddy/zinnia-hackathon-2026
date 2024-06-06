import { ReactNode } from 'react';

import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

export const CallForAssistance = ({
  callToAction,
  customInstruction,
}: {
  callToAction?: ReactNode;
  customInstruction?: string;
}) => {
  const instructionText = customInstruction || 'to add or make changes.';

  return (
    <p className="typography-content-body-bold">
      <span>{callToAction}</span> <span>Call</span>{' '}
      <a
        href={`tel:+${EVERLY_CONTACT_PHONE_NUMBER}`}
        className="typography-nav-links-inline"
      >
        {EVERLY_CONTACT_PHONE_NUMBER}
      </a>{' '}
      <span>{instructionText}</span>
    </p>
  );
};
