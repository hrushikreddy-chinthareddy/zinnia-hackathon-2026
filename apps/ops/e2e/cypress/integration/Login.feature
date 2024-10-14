Feature: [Non-SSO] Ops user logs into the Zinnia Live platform

Scenario: Ops user can log in and out of Zinnia Live
  Given User is on the 'Home page'
  When I navigate to the Login page
  Then I should see the login form
  
  When I enter valid credentials as 'Ops User'
  Then I should be on the 'Case Management page'

  When I click logout button
  Then I should be on the 'Home page'

Scenario: Ops user cannot log into Zinnia Live with invalid credentials
  Given User is on the 'Home page'
  When I navigate to the Login page
  Then I should see the login form
  
  When I enter invalid credentials
  Then I should see a login error message
