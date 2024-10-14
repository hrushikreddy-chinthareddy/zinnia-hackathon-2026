@DEPU-1135
Feature: Ops user views withdrawal information for a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar
  And I search by 'Policy Number' for 'TAX77045515'
  And I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'

Scenario: Ops user views the withdrawal information for a policy

When I navigate to the 'Policy' of a policy
  And I navigate to the 'Withdrawals' of a policy
  Then I should be on the 'Withdrawals page'
  And I should see withdrawal information for the policy
