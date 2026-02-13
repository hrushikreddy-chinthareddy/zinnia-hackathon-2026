import CaseManagementPage from './case-management.page';
// import FundsPage from './policy/policy/funds.page';
import NavigationBar from './components/navigation-bar';
import HomePage from './home.page';
import LoginPage from './login.page';
import HistoryPage from './policy/history.page';
import PeoplePage from './policy/people.page';
import CoveragePage from './policy/policy/coverage.page';
import PolicyDetailsPage from './policy/policy/policy-details.page';
import PolicyExtrasPage from './policy/policy/policy-extras.page';
import LoansPage from './policy/transactions/loans.page';
import PremiumsPage from './policy/transactions/premiums.page';
import WithdrawalsPage from './policy/transactions/withdrawals.page';
import PolicyManagementPage from './policy-management.page';
import CreateCasePage from './transaction-ops/create-case.page';

export default {
    'Case Management page': CaseManagementPage,
    'Coverage page': CoveragePage,
    // 'Funds page': FundsPage,
    'History page': HistoryPage,
    'Home page': HomePage,
    'Loans page': LoansPage,
    'Login page': LoginPage,
    'Navigation bar': NavigationBar,
    'People page': PeoplePage,
    'Policy Extras page': PolicyExtrasPage,
    'Policy Management page': PolicyManagementPage,
    'Policy Details page': PolicyDetailsPage,
    'Premiums page': PremiumsPage,
    'Withdrawals page': WithdrawalsPage,
    'Create Case page': CreateCasePage,
};
