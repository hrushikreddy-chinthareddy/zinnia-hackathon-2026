import ViewDetailCard from '@deps/components/card/view-detail-card/view-detail-card';

interface ViewDetailsContentProps {
    qualificationType: string;
    contractValue: string;
    policyDate: string;
    issueState: string;
}

export function ViewDetailsContent({ qualificationType, contractValue, policyDate, issueState }: ViewDetailsContentProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll pt-4 gap-4  ">
                {qualificationType && <ViewDetailCard cardTitle="Qualification Type" cardValue={qualificationType} />}
                {contractValue && <ViewDetailCard cardTitle="Contract Value" cardValue={`$ ${contractValue}`} />}
                {policyDate && <ViewDetailCard cardTitle="Policy Date" cardValue={policyDate} />}
                {issueState && <ViewDetailCard cardTitle="Issue State" cardValue={issueState} />}
            </div>
            <div className="grow" />
        </div>
    );
}
