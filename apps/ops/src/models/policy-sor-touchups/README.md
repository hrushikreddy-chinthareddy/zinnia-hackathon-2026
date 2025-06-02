This folder is for touchups to issues found in the policy-sor spec.

## Touchups

### Party

Party isn't the same as what comes back from Policy, so we're importing Policy Party and using that.
Specifically, the "insured" property is missing from the Party type, but utilizied in our application,

### Transaction

PayeeOrBeneficiary's type is modified in PolicyDetails, so we're importing Transaction PayeeOrBeneficiary and using that.
Charges - same thing. Specifically, 'coverageId', 'chargeAmount', and 'chargeAppliedRate'. coverageId and chargeAmount are missing from the Charge type, but utilizied in our application,
Payor - same thing. Fields are added to the Transactin returnTypes.
