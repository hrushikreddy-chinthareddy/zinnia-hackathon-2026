@DEPU-1134
Feature: Ops user views loan information for a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar
  And I search by 'Policy Number' for 'ZHA9260272'
  And I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'

Scenario: Ops user views the loan information for a policy

When I navigate to the 'Transactions' of a policy
  And I navigate to the 'Loans' of a policy
  Then I should be on the 'Loans page'
  And I should see loan information for the policy
