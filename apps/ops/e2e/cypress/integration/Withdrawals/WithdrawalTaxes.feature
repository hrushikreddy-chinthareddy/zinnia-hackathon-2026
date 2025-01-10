Feature: Ops user navigates to Withdrawals
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
 When I click on 'Policy Search' on the Navigation bar

Scenario: Ops user navigates to Withdrawal Taxes page with assertions on Federal tax

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

  Then I verify all information on Taxes page
  When I enter Federal tax as "50" percentage on Taxes page
  When I click Continue button on Taxes page
  Then I should a message for Tax withholding details are missing
  When I enter Dollar Amount as "100" for Federal tax
  When I click Continue button on Taxes page
  Then I should a message to enter either % or $ amount

Scenario: Ops user navigates to Withdrawal Taxes page with assertions for withholding on Federal tax

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

  Then I verify all information on Taxes page
  When I click Withhold minimum required federal tax checkbox on Taxes page
  When I click Do not withhold federal tax checkbox on Taxes page
  When I click Continue button on Taxes page
  Then I should see a message to select either minimum withholding or no withholding and tax withholding details are missing

Scenario: Ops user navigates to Withdrawal Taxes page with assertions on State tax

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

  Then I verify all information on Taxes page
  When I enter State tax as "50" percentage on Taxes page
  When I click Continue button on Taxes page
  Then I should a message for Tax withholding details are missing
  When I enter Dollar Amount as "100" for State tax
  When I click Continue button on Taxes page
  Then I should a message to enter either % or $ amount

Scenario: Ops user navigates to Withdrawal Taxes page with assertions for withholding on State tax

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

  Then I verify all information on Taxes page
  When I click Withhold minimum required state tax checkbox on Taxes page
  When I click Do not withhold state tax checkbox on Taxes page
  When I click Continue button on Taxes page
  Then I should see a message to select either minimum withholding or no withholding and tax withholding details are missing
  When I click Leave this transaction on Taxes page
  Then I should see withdrawal information for the policy

Scenario: Ops user navigates to Withdrawal Taxes page with positive flow

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

  Then I verify all information on Taxes page
  When I click Withhold minimum required federal tax checkbox on Taxes page
  When I click Withhold minimum required state tax checkbox on Taxes page
  When I click Continue button on Taxes page
  Then I should verify all information on Payee page

Scenario: Ops user navigates to Withdrawal Taxes page with tax percentage positive flow

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

  Then I verify all information on Taxes page
  When I enter Federal tax as "50" percentage on Taxes page
  When I enter State tax as "50" percentage on Taxes page
  When I click Continue button on Taxes page
  Then I should verify all information on Payee page

Scenario: Ops user navigates to Withdrawal Taxes page with Dollar Amount positive flow

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

  Then I verify all information on Taxes page
  When I enter Dollar Amount as "100" for Federal tax
  When I enter Dollar Amount as "100" for State tax
  When I click Continue button on Taxes page
  Then I should verify all information on Payee page