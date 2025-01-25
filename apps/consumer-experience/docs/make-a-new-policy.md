# Create a new Policy

1. go to https://qa-zahara-ui.zinnia.io/
1. log in with:
   un: platformAdmin
   password can be anything
1. In the upper right corner, download the XML of the product type you want to create
1. Click on the info icon to find out what fields you need to replace in the downloaded xml

   Hints:

   - for annuity, update `party_annuitant_1`
   - find all dates and replace with specific date (if needed) or leave as default
     - FOR ANNUITY PRODUCTS: you will need to remember what date you set this to for a later step

1. Update the `GovtID` field with the fake social security number associated with the user you log into consumer with.
   > This is partciular to consumer to make sure the policy gets associated with your user
   > to.
   - I always find this in the most roundabout way by logging a policy return from the policy api and finding the associated ssn there, so if someone has a better way, add it here. This also assumes that you have already logged in and have a policy. If that is not the case.... perhaps access management is an option?
1. Upload xml to the test harness and submit
1. To fully replicate automatic process, set communication delivery preference see[[Updating Delivery in Preferences Management API]]
   > this can be done before or after "lifecycling"
1. Search for newly added item (use last name or policy number)
   1. may take up to 30 seconds, you can just keep clicking "REFRESH" button
1. Click on the new item

## FOR LIFE POLICY

1. click `LIFECYCLE`
   > this simulates the end of day processing for policies

## FOR FIXED ANNUITY

1. go to `TRANSACTIONS` tab
   1. click on the plus sign in upper right corner
   2. change type to initial premium
   3. change effective date to match the issue date
   4. change party to OWNER
   5. update request amount to something pretty high
   6. click "submit"
1. Click `LIFECYCLE`
   1. this simulates end of day processing

# Fun Notes!

- you can use an email alias like `mackenzie.clarkson+1@zinnia.com` to create a new user with new policies
