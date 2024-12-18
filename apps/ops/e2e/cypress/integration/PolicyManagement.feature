Feature: Ops user searches for policies by Policy Number
Background: Login as Ops User
Given 'Ops User' logs into Zinnia Live

  # DEPU-17
  Scenario: Ops user searches for a policy that does not exist

    When I click on 'Policy Search' on the Navigation bar
    Then I should be on the 'Policy Management page'

    When I search by 'Policy Number' for 'invalidnumber'
    Then I should see a message for a policy not found in Search Results

  Scenario: Ops user searches for a policy by number

    When I click on 'Policy Search' on the Navigation bar
    Then I should be on the 'Policy Management page'

    When I search by 'Policy Number' for 'ZHA9260272'
    Then I should see the policy in Search Results

  Scenario: Ops user searches for a blank policy number

    When I click on 'Policy Search' on the Navigation bar
    Then I should be on the 'Policy Management page'

    When I search by 'Policy Number' with a blank field
    Then I should see an error message to enter a policy number

