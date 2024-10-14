# E2E Tools and Test Suites

This directory holds the tools necessary to run BDD E2E tests.

## Setup

### Install dependencies
Run `npm install` to install all the dependencies necessary to run `cypress` test suites.

### Local environment
To run Cypress tests locally, you need to add an `.env` file containing login credentials. Create the following file:

_e2e/.env_
```
OPS_USER_EMAIL=<please_enter_email_address>
OPS_USER_PASSWORD=<please_enter_password>
```

Please add the login credentials for the persona test email and password. You can find these in the following secure notes:

* [Policygenius OneLogin Secure Notes](https://policygenius.onelogin.com/notes2/234878)
* [Hybrid Origination 1Password Secure
    Notes](https://start.1password.com/open/i?a=272UHK56OVF4JNHB7PEUZJVFJI&h=nickhould.1password.com&i=pscxhafuylmb4ffd57dbto6uqq&v=5rwqznw5qedin3yoomecidmkxi)

## Usage

### Run tests using the `cypress` UI

`npm run cy:open`

### Run tests in headless mode

`npm run cy:run`

### Run tests on a remote instance

By default the tests are executed against the QA environment. To test against a different instance (e.g., DEV or localhost) use the `-c baseUrl <url>` parameter.

Examples:

```bash
npm cy:run -c baseUrl=https://qa.open.zinnia.com
```

```bash
npm cy:run -c baseUrl=http://localhost:3000
```

## Test Case Management
The automated E2E test cases are documented in TestRail from the Hybrid Origination team. The documented test cases can be found here:

* [TestRail - Digital Engagement Platform
    Project](https://breathelife.testrail.io/index.php?/projects/overview/21)
* TestRail Login Credentials
  * [Policygenius OneLogin Secure
      Notes](https://policygenius.onelogin.com/notes2/234198)
  * [Hybrid Origination 1Password Secure Notes](https://start.1password.com/open/i?a=272UHK56OVF4JNHB7PEUZJVFJI&h=nickhould.1password.com&i=6l5mb5w5ll7l2mfm62ilyoiq5y&v=5rwqznw5qedin3yoomecidmkxi)

**NOTE**: When a test is automated here, please update the corresponding TestRail test case as follows:
* _Type_ is set to _Automated_
* _Automated Type_ is set to _Cypress_
