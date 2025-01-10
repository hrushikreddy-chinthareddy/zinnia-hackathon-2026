Feature: Ops user views cases for Policy number for document
  Background: User should be logged in and on TransactionOps Suite page
  Given 'Ops User' logs into Zinnia Live
    When I click on 'TransactionOps Suite' on the Navigation bar
    Then I should be on the 'Create Case page'
    And I should see the detailed filter for case listing

  # Scenario: Case and task listing is successful
  #   When I navigate to the Create Case page
  #     And I search by case type:'Withdrawal', client:'DLIC' and document Id:'20240703-EM-207956'
  #     Then I should see the cases listed in cards
  #     And I should see case card should have all expected details

  #   When I click to expand case
  #     Then I should see the tasks listed for case

  Scenario: Case and task listing is unsuccessful due to invalid document
    When I navigate to the Create Case page
      And I search by case type:'Withdrawal', client:'DLIC' and document Id:'20240703-CW-207956'
      Then I should see text:'Invalid document number or client ID'

  Scenario: Cases not found due to invalid policy found
    When I navigate to the Create Case page
      And I search by case type:'SSW', client:'Security' and document Id:'20220629-EM-695273'
      Then I should see text:'Invalid document number or client ID'

