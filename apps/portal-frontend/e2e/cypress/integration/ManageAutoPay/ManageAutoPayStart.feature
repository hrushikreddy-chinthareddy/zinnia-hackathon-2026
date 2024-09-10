@DEP-37 @DEPU-1129
Feature: Ops user navigates to Manage AutoPay
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
  
Scenario: Ops user navigates to Manage AutoPay Start page

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'ZHA2047727'
  Then I should see the policy in Search Results
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy

  When I click Manage autopay on premiums page
  Then I should verify Update Autopay Details on Update Autopay page

  When I click Continue button on Update Autopay page
  Then I should see message to select a document to continue on Update Autopay page 
  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you
  When I click Leave this transaction
  Then I should see premium information for the policy
