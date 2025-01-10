@DEPU-1132
Feature: Ops user views information for people on a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live

    When I click on 'Policy Search' on the Navigation bar
    When I click on policy search dropdown and select 'Policy number' on policy search page
    And I enter policy search criteria text 'ZHA9260272'
    When I navigate to the policy details from a Policy Card
    Then I should be on the 'Policy Details page'
    And I should see the detailed summary of the policy

Scenario: Ops user views the information for people on the policy

  When I navigate to the 'People' of a policy
  Then I should be on the 'People page'
  And I should see information for people on the policy

Scenario: Ops user verifies Bank details on People page for a policy filter by Role: All

  When I navigate to the 'People' of a policy
  Then I should be on the 'People page'
  And I should verify radio for Filter by role on People page
  When I click on Filter by Role : 'All' on People page
  Then I should verify details of bank card
  And I should verify Primary Beneficiary details
  When I click on Bank Details card
  Then I should verify identification details on People page

Scenario: Ops user verifies Primary Beneficiary details on People page for a policy filter by Role: All

  When I navigate to the 'People' of a policy
  Then I should be on the 'People page'
  And I should verify radio for Filter by role on People page
  When I click on Filter by Role : 'All' on People page
  Then I should verify details of bank card
  And I should verify Primary Beneficiary details
  When I click on Primary Beneficiary Details card
  Then I should verify Beneficiary details