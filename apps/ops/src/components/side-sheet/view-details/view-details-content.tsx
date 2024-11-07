import ViewDetailCard from '@deps/components/card/view-detail-card/view-detail-card';

interface ViewDetailsContentProps {
    qualificationType: string;
    contractValue: string;
    policyDate: string;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
}
export function ViewDetailsContent({ qualificationType, contractValue, policyDate }: ViewDetailsContentProps) {
    const formattedPolicyDate = formatDate(policyDate);
    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll pt-4 gap-4  ">
                {qualificationType && <ViewDetailCard label="Qualification Type" value={qualificationType} />}
                {contractValue && <ViewDetailCard label="Contract Value" value={`$ ${contractValue}`} />}
                {policyDate && <ViewDetailCard label="Policy Date" value={formattedPolicyDate} />}
            </div>
            <div className="grow" />
        </div>
    );
}
