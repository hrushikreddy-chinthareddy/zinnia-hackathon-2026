import { PiiProps } from '@/types/pii';
import { DEFAULT_ERROR_STRING, toSentenceCase } from '@/utils/strings';

import { Name } from './Name';

interface Props extends PiiProps {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  prefixDisplay?: string | null;
  suffix?: string | null;
}

export const FullName = ({ firstName, lastName, ...rest }: Props) => {
  if (!firstName && !lastName) {
    return DEFAULT_ERROR_STRING;
  }

  return (
    <>
      <Name displayName={toSentenceCase(firstName)} {...rest} />{' '}
      <Name displayName={toSentenceCase(lastName)} {...rest} />
    </>
  );
};
