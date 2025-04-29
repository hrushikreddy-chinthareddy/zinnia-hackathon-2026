import { PiiProps } from '@/types/pii';
import { DEFAULT_ERROR_STRING, toSentenceCase } from '@/utils/strings';

import { Name } from './Name';

interface BaseProps extends PiiProps {
  middleName?: string | null;
  prefixDisplay?: string | null;
  suffix?: string | null;
}

// When fullName is passed, firstName and lastName shouldn't be passed
type FullNameProps = BaseProps & {
  fullName?: string | null;
  firstName?: never;
  lastName?: never;
};

// When both firstName and lastName are passed, fullName shouldn't be passed
type FirstLastProps = BaseProps & {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: never;
};

type Props = FullNameProps | FirstLastProps;

export const FullName = ({ firstName, lastName, fullName, ...rest }: Props) => {
  if (!fullName && !(firstName && lastName)) {
    return DEFAULT_ERROR_STRING;
  }

  return (
    <>
      {fullName && <Name displayName={toSentenceCase(fullName)} {...rest} />}
      {firstName && lastName && (
        <>
          <Name displayName={toSentenceCase(firstName)} {...rest} />
          &nbsp;
          <Name displayName={toSentenceCase(lastName)} {...rest} />
        </>
      )}
    </>
  );
};
