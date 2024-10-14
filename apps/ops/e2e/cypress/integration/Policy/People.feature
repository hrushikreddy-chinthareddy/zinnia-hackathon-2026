@DEPU-1132
Feature: Ops user views information for people on a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live

  When I click on 'Policy Search' on the Navigation bar
  Then I should be on the 'Policy Management page'
  When I search by 'Policy Number' for 'ZHA2047727'
  Then I should see the policy in Search Results
  When I click on Policy on a Policy card

Scenario: Ops user views the information for people on the policy

When I navigate to the 'People' of a policy
  Then I should be on the 'People page'
  And I should see information for people on the policy
