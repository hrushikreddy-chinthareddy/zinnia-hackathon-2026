import { IllustrationsActivity } from './illustrations';
import { TransactionActivity } from './transaction-activity';

export const Activity = () => {
    return (
        <div>
            <TransactionActivity />
            <IllustrationsActivity />
        </div>
    );
};
