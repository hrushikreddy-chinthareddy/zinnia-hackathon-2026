@DEPU-1130    
Feature: Ops user views coverage details for a policy
Background: Ops user views the details for a policy
Given 'Ops User' logs into Zinnia Live
  When I click on 'Policy Search' on the Navigation bar
  And I search by 'Policy Number' for 'ZHA9260272'
  And I navigate to the policy details from a Policy Card
  Then I should be on the 'Policy Details page'

Scenario: Ops user views the coverage details of a policy

When I navigate to the 'Coverage' of a policy
  Then I should be on the 'Coverage page'
  And I should see the detailed coverage information of the policy
