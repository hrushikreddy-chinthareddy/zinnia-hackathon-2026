@DEPU-1133
Feature: Ops user views premium information for a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar
  And I search by 'Policy Number' for 'ZHA9260272'
  And I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'

Scenario: Ops user views the premium information for a policy

When I navigate to the 'Policy' of a policy
  And I navigate to the 'Premiums' of a policy
  Then I should be on the 'Premiums page'
  And I should see premium information for the policy
