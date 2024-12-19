@DEP-37 @DEPU-1129
Feature: Ops user navigates to One Time Payment
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
 When I click on 'Policy Search' on the Navigation bar

Scenario: Ops user navigates to One Time Payment Summary page Payor details validation

  When I click on policy search dropdown and select 'Policy number' on policy search page
  And I enter policy search criteria text 'TAX77045515'
  When I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'
  And I should see the detailed summary of the policy

  When I click on Premiums on Policy Details Page
  Then I should see premium information for the policy
  When I click One Time Payment on premiums page
  Then I should verify Start page Details on one time payment start page
  When I select document as 'Process without a document'
  Then I should see message if I continue without a document selection, we cant update on OnBase for you
  When I click Continue button on One Time Payment Start page
  Then I should verify Amount page details on One Time Payment Amount page
  When I enter Effective date on One Time payment Amount page
  When I enter Premium payment Amount as "100" on One Time payment Amount page
  When I click Continue button on One Time payment Amount page
  Then I should verify Payor information on One Time Payor page
  When I select a payor on One Time Payment Payor page
  When I click Continue button on One Time Payment Payor page
  Then I should verify One Time Payment Details on One Time Payment method page

  When I select bank details on One Time Payment page
  When I click Continue button on One Time Payment page
  Then I should verify One Time Payment Summary Details
  And I should verify Summary premium payment amount details
  And I should verify Summary Effective date details
  And I should verify Payor details on Summary page

  When I click Continue button on Summary page
  Then I should verify Confirm page details
  When I click logout button
  Then Ops users navigates to homepage
