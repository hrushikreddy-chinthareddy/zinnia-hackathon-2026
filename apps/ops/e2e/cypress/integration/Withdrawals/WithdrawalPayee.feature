Feature: Ops user navigates to Withdrawals
Background: Login as Ops User test test
  Given 'Ops User' logs into Zinnia Live
  
Scenario: Ops user navigates to Withdrawal Payee page

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'TAX77045515'
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
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

  When I select a payee on Payee page
  When I click Continue button on Payee page
  Then I should verify all information on Payment Method page
