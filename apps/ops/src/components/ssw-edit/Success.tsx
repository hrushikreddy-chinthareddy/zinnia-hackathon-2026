import { Icon, IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import Button from '../button/button';
interface SuccessProps {
    successTitle: string;
    successMessage: string;
    closeCallback: () => void;
}
const Success: FC<SuccessProps> = ({ successTitle, successMessage, closeCallback }) => {
    const successHtml = { __html: `${successMessage}` };
    return (
        <div className="flex flex-col items-center gap-4">
            <Icon width={50} height={50} className="text-semantic-success" type={IconType.CIRCLE_CHECKMARK} />
            <h3 className="typography-desktop-headline-3-d">{successTitle}</h3>
            <p className="typography-content-body" dangerouslySetInnerHTML={successHtml} />
            <Button onClick={closeCallback}>Close</Button>
        </div>
    );
};

export default Success;
