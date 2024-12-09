@DEP-37 @DEPU-1129
Feature: Ops user views details for a policy
Background: Ops user views a policy from the search results

Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar

# DEP-37, DEP-1129
Scenario: Ops user views the details of a policy from a Policy Card using Policy number as search criteria
    When I click on policy search dropdown and select 'Policy number' on policy search page
    And I enter policy search criteria text 'TAX77045515'
    When I navigate to the policy details from a Policy Card
    Then I should be on the 'Policy Details page'
    And I should see the detailed summary of the policy

Scenario: Ops user views the details of a policy from a Policy Card using First name and last name as search criteria
    When I click on policy search dropdown and select 'Name' on policy search page
    And I enter policy search criteria firstName 'Zaharaqa' and lastName '17194207'
    When I navigate to the policy details from a Policy Card
    Then I should be on the 'Policy Details page'
    And I should see the detailed summary of the policy
