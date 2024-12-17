Feature: Ops user navigates to Withdrawals
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
 When I click on 'Policy Search' on the Navigation bar

Scenario: Ops user navigates to Withdrawal Amount page with distribution type as Surrender

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

  When I click on Distribution type "Surrender" on Amount page
  Then I should see message a full withdrawal will end the owners coverage
  When I enter Effective date on Amount page
  When I click on Continue button on Amount page

Scenario: Ops user navigates to Withdrawal Amount page with distribution type as Partial and Custom Amount

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

  When I click on Distribution type "Partial" on Amount page
  When I Disbursement type "Net" on Amount page
  When I enter Effective date on Amount page
  When I select withdrawal as Custom amount on Amount page
  When I enter custom amount "$10000.00" on Amount page
  When I select Fund Disbursement type Pro rata on Amount page
  When I click on Leave this transaction on Amount page
  Then I should see withdrawal information for the policy

Scenario: Ops user navigates to Withdrawal Amount page with distribution type as Partial and Maximum Amount

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

  When I click on Distribution type "Partial" on Amount page
  When I Disbursement type "Net" on Amount page
  When I enter Effective date on Amount page
  When I select withdrawal as Maximum amount on Amount page
  When I select Fund Disbursement type Pro rata on Amount page
  When I click on Leave this transaction on Amount page
  Then I should see withdrawal information for the policy