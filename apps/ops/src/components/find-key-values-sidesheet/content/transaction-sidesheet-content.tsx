import { Transaction } from '@xd/api-types/dist/generated-types/sor';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    console.log({ transaction });
    return <div>yolo</div>;
};
