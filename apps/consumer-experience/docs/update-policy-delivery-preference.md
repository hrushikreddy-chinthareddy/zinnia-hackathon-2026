# Update the policy delivery preference

## Why?

When policies are made by the automatic process, a delivery preference is automatically set to `EMAIL`. When we manually create policies, we have to manually do this via the preference management API. This is not a required step for most testing purposes, however, if you are testing the policy acknowledgement flow, or verifying the policy delivery document, you will need to set this. See more about policy acknowledgement flow [here](policy-acknowledgement-flow.md)

## How?

1. API `create e Delivery Preference`: `{{baseUrl}}/preferences/v1/:partyId/e-delivery/:planCode/:policyNumber`
2. add path variables
   - To find partyId:
     - Look at a Datadog log from one of your requests
     - OR log your `access_token` and decrypt at jwt.io
3. in body add values for these keys:
   ```
   {
   "carrierId": "", // carrierId can be found in test harness
   "deliveryOption": "EMAIL",
   "effectiveFrom": "" // date in iso form,
   "documentType": "NWB",
   "email": "", // your email
   "effectiveTo": "" // date in future from effectiveFrom in iso form
   }
   ```
