Feature: Ops user navigates to Manage AutoPay
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
  
Scenario: Ops user navigates to Manage AutoPay Payment page

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'ZHA2047727'
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy

  When I click Manage autopay on premiums page
  Then I should verify Update Autopay Details on Update Autopay page

  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you 

  When I click Continue button on Update Autopay page
  Then I should verify Manage Autopay Amount Details on Amount page
  When I enter Payment amount '$100.00' on Amount page
  When I select Payment frequency as 'QUARTERLY' on Amount page
  When I enter Next payment date as '05/20/2024' on Amount page
  When I click Continue button on Amount page
  Then I should verify Manage Autopay Payor Details on Payor page
  And I should verify Payor tags on Payor page
  When I select a payor on Payor page
  When I click Continue button on Payor page

  Then I should verify Manage Autopay Payment Details on Payment page
  When I select a payment account on Payment page
  When I click Continue button on Payment page
  Then I should verify Manage Autopay Summary Details

  Scenario: Ops user navigates to Manage AutoPay Payment page with no payment account

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'ZHA2047727'
  When I click on Policy on a Policy card
  Then I should verify all information on Policy Details page
  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy

  When I click Manage autopay on premiums page
  Then I should verify Update Autopay Details on Update Autopay page

  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you 

  When I click Continue button on Update Autopay page
  Then I should verify Manage Autopay Amount Details on Amount page
  When I enter Payment amount '$100.00' on Amount page
  When I select Payment frequency as 'QUARTERLY' on Amount page
  When I enter Next payment date as '05/20/2024' on Amount page
  When I click Continue button on Amount page
  Then I should verify Manage Autopay Payor Details on Payor page
  And I should verify Payor tags on Payor page
  When I select a payor on Payor page
  When I click Continue button on Payor page

  Then I should verify Manage Autopay Payment Details on Payment page
  When I deselect a payment account 'CITIZEN BANK' on Payment page
  When I click Continue button on Payment page
  Then I should see message to select a bank account to make this payment
  When I click Leave transaction button on Payment page
  Then I should see premium information for the policy
