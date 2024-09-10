import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { Status } from '@deps/models/policy/sor-policy';

interface CardBarPolicyHolderProps {
    label: string;
    value: string;
    status?: Status;
    variant?: BadgeVariant;
}

const CardBarPolicyHolder = ({ label, value, status }: CardBarPolicyHolderProps) => {
    return (
        <div className="flex flex-col">
            <label className="font-primary text-sm font-bold">{label}</label>
            <div className="flex items-center">
                <span className="mr-4 font-primary text-[28px]">{value}</span>
                {!!status && <Badge rounded={true} label={toTitleCase(status)} variant={BadgeVariant.Positive} />}
            </div>
        </div>
    );
};

export default CardBarPolicyHolder;
