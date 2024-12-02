import { Icon, IconType } from '@zinnia/bloom/components';
import React, { FC } from 'react';

interface ErrorProps {
  errorMessage: React.ReactNode;
  className?: string;
}
export const Error: FC<ErrorProps> = ({
  errorMessage,
  className = ''
}) => {
  return (
    <div className={`flex justify-start items-center border border-[--color-primary-color-primary-50-percent-opacity]
      shadow-md rounded-md bg-[--color-yellow-color-50-yellow] p-2 gap-2 ${className}`}>
      <Icon
        className='text-[--color-primary-color-primary-dark]'
        width={25}
        height={25}
        type={IconType.ALERT_EXCLAMATION}
      />
      <h3 className="text-md">{errorMessage}</h3>
    </div>
  );
};
