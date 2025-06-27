import { FC, ReactNode } from 'react';

import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

import Button from '../button/button';

interface ErrorProps {
    errorTitle: string;
    errorMessage: ReactNode;
    closeCallback: () => void;
}
const Failed: FC<ErrorProps> = ({
    errorTitle,
    errorMessage,
    closeCallback,
}) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <HexExclamationIcon
                className="text-semantic-error"
                height={50}
                role="presentation"
                width={50}
            />
            <h3 className="typography-desktop-headline-3-d">{errorTitle}</h3>
            <p className="typography-content-body"> {errorMessage}</p>
            <Button onClick={closeCallback}>Close</Button>
        </div>
    );
};

export default Failed;
