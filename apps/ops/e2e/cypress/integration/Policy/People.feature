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
