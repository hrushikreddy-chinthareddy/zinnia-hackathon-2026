import { Label } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { AccountValue } from '@/components/policy-overview/AccountValue';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './Funds.module.css';

const fundAllocations = [
  {
    name: 'Security Benefit Fixed UL Fund ',
    amount: 250343.12,
    allocation: 50,
  },
  {
    name: 'Security Benefit Fixed UL Fund ',
    amount: 250343.12,
    allocation: 50,
  },
];

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <div className="container">
      <HeaderBreadcrumb title="Funds" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <div className={styles.container}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          className={clsx({ 'pb-2xl': fundAllocations.length })}
        />
        {fundAllocations.map(allocation => {
          return (
            <div className={styles.item} key={allocation.name}>
              <div className="stacked-items">
                <Label>Security Benefit Fixed UL Fund </Label>
                <p className="typography-content-body-sm">
                  {formatUSDollars(allocation.amount)}
                </p>
              </div>
              <div className="stacked-items">
                <Label>Allocation</Label>
                <p className="typography-content-body-sm">{`${allocation.allocation}%`}</p>
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}
