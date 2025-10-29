'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Address,
  BankAccount,
  DisbursementPaymentForm,
  LineOfBusiness,
} from '@xd/api-types/dist/generated-types/sor';
import { Label, Loader, Radio } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  FormProvider,
  useForm,
  SubmitHandler,
  Controller,
  useWatch,
} from 'react-hook-form';

import { Button } from '@/components/button/Button';
import { AddPaymentMethod } from '@/components/stepped-workflow/common/AddPaymentMethod';
import { CancelDialogLink } from '@/components/stepped-workflow/common/CancelDialogLink';
import { SelectableAddresses } from '@/components/stepped-workflow/common/SelectableAddresses';
import { SelectablePaymentMethods } from '@/components/stepped-workflow/common/SelectablePaymentMethods';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { getPaymentMethods } from '@/queries/payment-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PaymentProvider } from '@/types/carrier-config';
import { PaymentMethod } from '@/types/payment';

import { FreeLookCancelAction } from '../provider/types';
import { useFreeLookCancel } from '../provider/useFreeLookCancel';
import { stepsInfo } from '../steps';

interface SelectDistributionProps {
  activeAddresses: Address[];
  correlationId: string;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  paymentProvider?: PaymentProvider;
  initialPaymentMethods?: PaymentMethod[];
}

type FormValues = {
  addressId?: string;
  paymentMethodId?: string;
  paymentForm: DisbursementPaymentForm;
};

const distributionOptions = ({
  allowDirectDeposit,
}: {
  allowDirectDeposit: boolean;
}) => {
  const options = [
    {
      key: DisbursementPaymentForm.CHECK,
      label: 'Paper check (mailed to your address)',
      ariaLabel: 'Paper check (mailed to your address)',
      value: DisbursementPaymentForm.CHECK,
    },
  ];

  if (allowDirectDeposit) {
    options.unshift({
      key: DisbursementPaymentForm.ACH,
      label: 'Direct deposit (ACH)',
      ariaLabel: 'Direct deposit (ACH)',
      value: DisbursementPaymentForm.ACH,
    });
  }

  return options;
};

export const SelectDistribution = ({
  activeAddresses,
  policyNumber,
  planCode,
  lineOfBusiness,
  paymentProvider,
  initialPaymentMethods,
  correlationId,
}: SelectDistributionProps) => {
  const { dispatch, state } = useFreeLookCancel();
  const router = useRouter();
  const { nextStep } = useGetTransactionStepData({
    stepsInfo,
  });
  const allowDirectDeposit = paymentProvider === PaymentProvider.ZINNIA;

  // Include the query to getPaymentMethods here because users can add a new
  // paymentMethod in the flow and we need to invalidate the query if that
  // happens so they see the new paymentMethod
  const {
    data: paymentMethods,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: [
      QueryKeys.PAYMENT_METHODS,
      policyNumber,
      planCode,
      paymentProvider,
    ],
    queryFn: () => getPaymentMethods(policyNumber, planCode),
    initialData: initialPaymentMethods,
  });

  const queryClient = useQueryClient();

  const handleAddPaymentMethod = () => {
    queryClient.invalidateQueries({
      queryKey: [
        QueryKeys.PAYMENT_METHODS,
        policyNumber,
        planCode,
        paymentProvider,
      ],
    });
  };

  // TODO: could move this into default values set and then pass
  // to the component from formvalues
  const defaultSelectedBankId = useMemo(() => {
    return (
      (state?.distributionMethodStep?.type === DisbursementPaymentForm.ACH &&
        (state?.distributionMethodStep?.method as BankAccount)?.bankId) ||
      paymentMethods?.find(bank => bank.autopayEnabled)?.bankId ||
      paymentMethods?.[0]?.bankId
    );
  }, [paymentMethods, state?.distributionMethodStep]);

  const defaultSelectedAddressId = useMemo(() => {
    return (
      // TODO: is this the right check? verify against profile
      (state?.distributionMethodStep?.type === DisbursementPaymentForm.CHECK &&
        (state?.distributionMethodStep?.method as Address)?.addressId) ||
      activeAddresses.find(address => address.isPreferred)?.addressId ||
      activeAddresses?.[0]?.addressId
    );
  }, [activeAddresses, state?.distributionMethodStep]);

  const methods = useForm<FormValues>({
    defaultValues: {
      addressId: defaultSelectedAddressId ?? '',
      paymentMethodId: defaultSelectedBankId ?? '',
      // this is called paymentForm rather than distributionType because that is what the backend expects
      paymentForm: allowDirectDeposit
        ? DisbursementPaymentForm.ACH
        : DisbursementPaymentForm.CHECK,
    },
  });

  const paymentForm = useWatch({
    control: methods.control,
    name: 'paymentForm',
  });

  const handleSubmitDistributionMethod: SubmitHandler<FormValues> = data => {
    const method =
      data.paymentForm === DisbursementPaymentForm.ACH
        ? paymentMethods?.find(bank => bank.bankId === data.paymentMethodId)
        : activeAddresses?.find(
            address => address.addressId === data.addressId
          );

    dispatch({
      type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DISTRIBUTION_METHOD_STEP,
      payload: {
        type: data.paymentForm,
        // TODO: fix the casting here
        method: method as Address | BankAccount,
      },
    });

    router.push(nextStep?.url || '');
  };

  return (
    <>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </div>
      )}
      {isError && (
        <div>
          We’re having trouble getting your distribution methods. Please try
          again later.
        </div>
      )}
      {isSuccess && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmitDistributionMethod)}>
            <div className="mb-xl">
              <div className="mb-lg">
                <Label labelFor="distributionMethod">
                  How should the payment be sent?
                </Label>
              </div>
              <Controller
                control={methods.control}
                name="paymentForm"
                render={({ field }) => (
                  <Radio
                    id="distributionMethod"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    options={distributionOptions({ allowDirectDeposit })}
                  />
                )}
              />
            </div>
            {paymentForm === DisbursementPaymentForm.ACH && (
              <div>
                <h2 className="typography-titles-subtitle mb-lg">
                  Bank accounts
                </h2>
                <SelectablePaymentMethods
                  activePaymentMethods={paymentMethods}
                  defaultSelectedBankId={defaultSelectedBankId}
                  correlationId={correlationId}
                />
                <AddPaymentMethod
                  planCode={planCode}
                  policyNumber={policyNumber}
                  lineOfBusiness={lineOfBusiness}
                  onAddPaymentMethod={handleAddPaymentMethod}
                  addBankInlineEnabled={
                    paymentProvider === PaymentProvider.PAYMENTUS
                  }
                />
              </div>
            )}
            {paymentForm === DisbursementPaymentForm.CHECK && (
              <div>
                <h2 className="typography-titles-subtitle mb-lg">Addresses</h2>
                <SelectableAddresses
                  activeAddresses={activeAddresses}
                  lineOfBusiness={lineOfBusiness}
                  planCode={planCode}
                  policyNumber={policyNumber}
                  defaultSelectedAddressId={defaultSelectedAddressId}
                  correlationId={correlationId}
                />
              </div>
            )}
            <div
              className={commonStyles.stepActions}
              aria-label="save details and navigate to next step"
            >
              <Button
                type="submit"
                disabled={
                  isError ||
                  (!paymentMethods && !activeAddresses) ||
                  (paymentMethods?.length === 0 &&
                    activeAddresses?.length === 0)
                }
              >
                Continue
              </Button>
              <CancelDialogLink />
            </div>
          </form>
        </FormProvider>
      )}
    </>
  );
};
