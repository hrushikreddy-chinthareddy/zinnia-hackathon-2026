# How to use Workflow Container

First, create your feature's container and import the wrapping Provider and pass in WorkflowContainer with the respective policy and steps array of objects like the examples below.

This allows each feature to determine the Provider context used and leaves the navigation handling to be owned by the workflow's context.

```
return (
    <PremiumProvider>
        <WorkflowContainer policy={policy} steps={steps} />
    </PremiumProvider>
);
```

```
const steps: Step[] = [
    {
        ariaLabel: startLabel,
        component: <Start policyNumber={policy.policyNumber} />,
        screenReaderLabel: startLabel,
        index: 0,
        text: startLabel,
    },
    {
        ariaLabel: payorLabel,
        component: <Payor policy={policy} />,
        screenReaderLabel: payorLabel,
        index: 1,
        text: payorLabel,
    },
    ...
];
```

Next, you'll want to make sure you include `useWorkflow`'s `goToNext` to handle the navigation when defining the `handleContinue` logic. This must be done to each child component used within this workflow for the navigation to work throughout the feature.

```
const { goToNext } = useWorkflow();
...
// example
const handleContinue = async () => {
    if (validateFields(effectiveDate, paymentAmount)) {
        goToNext();
    } else return;
};
```

NOTE: This step still applies if you're creating placeholder components within the parent container. See example below.

```
const Start = ({ policy }: UpdatePremiumAutopayContainerProps) => {
    const { goToNext } = useWorkflow();

    const handleContinue = async () => {
        goToNext();
    }

    return (
        <div className="responsive-padding flex flex-col items-start">
            Start
            <TransactionNavigationButtons
                handleContinue={handleContinue}
                parentPage={ParentPage.Premiums}
                planCode={policy?.product?.planCode}
                policyNumber={policy.policyNumber}
            />
        </div>
    );
};
```
