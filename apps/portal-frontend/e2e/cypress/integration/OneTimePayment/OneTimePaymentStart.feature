@DEP-37 @DEPU-1129
Feature: Ops user navigates to One Time Payment
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live

Scenario: Ops user navigates to One Time Payment Start page without document selection

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'TAX77045515'
  Then I should see the policy in Search Results
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy

  When I click One Time Payment on premiums page
  Then I should verify Start page Details on one time payment start page

  When I click Continue button on One Time Payment Start page
  Then I should see message to select a document to continue on One Time Payment page

  When I click Leave this transaction
  Then I should see premium information for the policy

Scenario: Ops user navigates to One Time Payment Start page with document selection

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'TAX77045515'
  Then I should see the policy in Search Results
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy

  When I click One Time Payment on premiums page
  Then I should verify Start page Details on one time payment start page

  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you

  When I click Continue button on One Time Payment Start page
  Then I should verify Amount page details on One Time Payment Amount page