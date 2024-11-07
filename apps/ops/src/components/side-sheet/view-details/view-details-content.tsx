import ViewDetailCard from '@deps/components/card/view-detail-card/view-detail-card';

interface ViewDetailsContentProps {
    qualificationType: string;
    contractValue: string;
    policyDate: string;
}

export function ViewDetailsContent({ qualificationType, contractValue, policyDate }: ViewDetailsContentProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll pt-4 gap-4  ">
                {qualificationType && <ViewDetailCard label="Qualification Type" value={qualificationType} />}
                {contractValue && <ViewDetailCard label="Contract Value" value={`$ ${contractValue}`} />}
                {policyDate && <ViewDetailCard label="Policy Date" value={policyDate} />}
            </div>
            <div className="grow" />
        </div>
    );
}
