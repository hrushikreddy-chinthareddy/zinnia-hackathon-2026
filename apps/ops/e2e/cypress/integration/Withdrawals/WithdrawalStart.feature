@DEP-37 @DEPU-1129
Feature: Ops user navigates to Withdrawals
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
 When I click on 'Policy Search' on the Navigation bar

Scenario: Ops user navigates to Withdrawal Start page without any document selection

  When I click on policy search dropdown and select 'Policy number' on policy search page
  And I enter policy search criteria text 'TAX77045515'
  When I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'
  And I should see the detailed summary of the policy

  When I click on Withdrawals on Policy Details Page
  Then I should see withdrawal information for the policy

  When I click on Start a Withdrawal on Withdrawals page
  Then I should see Start a Withdrawal details on Withdrawal Start page
  When I click on Continue button on Withdrawal Start page
  Then I should see a message to select a document to continue
  When I click Leave this transaction on Withdrawal Start page
  Then I should see withdrawal information for the policy

Scenario: Ops user navigates to Withdrawal Start page with document selection

  When I click on policy search dropdown and select 'Policy number' on policy search page
  And I enter policy search criteria text 'TAX77045515'
  When I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'
  And I should see the detailed summary of the policy

  When I click on Withdrawals on Policy Details Page
  Then I should see withdrawal information for the policy

  When I click on Start a Withdrawal on Withdrawals page
  Then I should see Start a Withdrawal details on Withdrawal Start page
  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you
  When I click on Continue button on Withdrawal Start page
  Then I verify all information on Amount page
