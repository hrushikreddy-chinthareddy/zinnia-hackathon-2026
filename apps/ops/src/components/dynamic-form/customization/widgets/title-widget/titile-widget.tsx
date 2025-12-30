import { WidgetProps } from '@rjsf/utils';

import classes from '../bene-transaction-accordion/bene-transaction-accordion.module.css';

//TODO: refactor code

const TitleWidget = ({ formContext, id }: WidgetProps) => {
    const idParts = id?.split('_');
    const partyIndex = 0;
    const addressIndex = idParts?.[1];

    const parties = formContext?.customData?.contractInfo?.parties;
    const addressType =
        parties?.[partyIndex]?.addresses?.[addressIndex]?.addressType;

    const getLabel = (type: string) => {
        switch (type) {
            case 'RESIDENCE':
                return 'Residential Address';
            case 'DEFAULT':
                return 'Mailing Address';
            default:
                return 'Address';
        }
    };

    return <div className={classes.text}>{getLabel(addressType)}</div>;
};

export default TitleWidget;
