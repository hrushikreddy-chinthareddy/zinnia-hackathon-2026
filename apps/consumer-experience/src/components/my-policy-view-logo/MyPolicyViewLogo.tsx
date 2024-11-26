import clsx from 'clsx';
import { FC } from 'react';

import ZinniaLogo from '@/app/styles/assets/zinnia-logo-icon.svg';

interface MyPolicyViewLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MyPolicyViewLogo: FC<MyPolicyViewLogoProps> = ({
  className,
  style,
}: MyPolicyViewLogoProps) => {
  const wrapperClasses = clsx('flex-center', {
    [className as string]: !!className,
  });

  return (
    <span className={wrapperClasses} style={style}>
      <span className="mr-md">Powered by</span>
      <ZinniaLogo width={16} height={16} />
      <span className="typography-content-body-sm-bold">MyPolicyView</span>
    </span>
  );
};
