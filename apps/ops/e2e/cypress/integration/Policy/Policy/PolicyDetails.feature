@DEP-37 @DEPU-1129
Feature: Ops user views details for a policy
Background: Ops user views a policy from the search results
Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar
  And I search by 'Policy Number' for 'ZHA9260272'
  Then I should see the policy in Search Results

# DEP-37, DEP-1129
Scenario: Ops user views the details of a policy from a Policy Card
    When I navigate to the policy details from a Policy Card
    Then I should be on the 'Policy Details page'
    And I should see the detailed summary of the policy
