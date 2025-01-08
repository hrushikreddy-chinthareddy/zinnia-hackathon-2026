Feature: Ops user searches for policies by Policy Number
Background: Login as Ops User test test
 Given 'Ops User' logs into Zinnia Live
 When I click on 'Policy Search' on the Navigation bar

  # DEPU-17
  Scenario: Ops user searches for a policy that does not exist

    When I click on policy search dropdown and select 'Policy number' on policy search page
    And I enter policy search criteria text '123456'
    Then I should see a message for a policy not found in Search Result

  Scenario: Ops user searches for a policy by number

    When I click on policy search dropdown and select 'Policy number' on policy search page
    And I enter policy search criteria text 'ZHA2047727'
    When I navigate to the policy details from a Policy Card
    Then I should be on the 'Policy Details page'
    And I should see the detailed summary of the policy

  Scenario: Ops user searches for a blank policy number

    When I click on policy search dropdown and select 'Policy number' on policy search page

    When I enter policy search criteria with blank field
    Then I should see an error message to enter a policy number

