'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Frequency, PartyRole, SystematicProgram } from '@xd/api-types/dist/generated-types/sor';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import { Button, SideSheet } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import { getAllSystematicPrograms, getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs } from '@/types/policy';
import { FormSteps } from '@/types/transactions';
import { formatUSDollars } from '@/utils/currency';

import { FullName } from '../pii/FullName';
import { Confirm } from '../transaction-steps/confirm/Confirm';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';



type CancelAutopaySidesheetProps = {
  disabled?: boolean;
  paymentAmount: number;
  nextActivityDate: string;
  frequency: Frequency;
  arrangementId: string;
} & PolicyRequestInputs;


type ViewState = Exclude<FormSteps, FormSteps.FORM | FormSteps.VERIFY_IDENTITY | FormSteps.VERIFY_IDENTITY_CODE>


export const CancelAutopaySidesheet = ({
  arrangementId,
  paymentAmount,
  nextActivityDate,
  planCode,
  policyNumber,
  frequency,
  disabled = false,
}: CancelAutopaySidesheetProps) => {
  const [viewState, setViewState] = useState<ViewState>(FormSteps.CONFIRM);
  const [open, setOpen] = useState<boolean>(false);

  const { data: payorPartyId, isLoading: partyIdIsLoading } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS, planCode, policyNumber, arrangementId],
    queryFn: () => getAllSystematicPrograms({ planCode, policyNumber }),
    select: (data) => {
      const arrangement = data.find(sp => sp.arrangementId === arrangementId)
      // spec says to use SystematicProgram.parties
      // but it is null, so use SystematicProgram.party
      let partyArray = [] as SystematicProgram['parties'];

      if (arrangement?.party?.length) {
        partyArray = arrangement.party
      }

      // and handle for if it switches randomly
      if (arrangement?.parties?.length) {
        partyArray = arrangement.parties
      }

      if (!partyArray?.length) return

      const payorId = partyArray.find(p => p.partyRole === PartyRole.PAYOR)?.partyId || ''
      return payorId
    },
    enabled:
      !!planCode?.length && !!policyNumber?.length && !!arrangementId.length
  });

  const { data: payorFullName, isLoading: payorIsLoading } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS, planCode, policyNumber, arrangementId, payorPartyId],
    queryFn: () => getPolicyProfile(planCode, policyNumber),
    select: (data) => {
      const party = data.parties.find(p => p.partyId === payorPartyId)

      return ({
        firstName: party?.firstName,
        lastName: party?.lastName,
        fullName: party?.fullName
      })
    },
    enabled:
      !!planCode?.length && !!policyNumber?.length && !!arrangementId.length && !!payorPartyId?.length
  })

  const mutation = useMutation({
    mutationFn: async () => {
      // set promise to resolve after 3 seconds
      // dummy implementation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // see CUI-827 for more details

    },
    onMutate: () => {
      setViewState(FormSteps.LOADING);
    },
    onSuccess: () => {
      setViewState(FormSteps.SUCCESS);
    },
    onError: () => {
      setViewState(FormSteps.ERROR);
    },
  });

  const disableButton = disabled || mutation.isPending || mutation.isSuccess
  const handleClose = () => {
    setOpen(false);
  };

  const partyName = payorFullName?.fullName?.length ? {
    fullName: payorFullName.fullName
  } : {
    firstName: payorFullName?.firstName,
    lastName: payorFullName?.lastName
  }


  const Views: Record<Partial<ViewState>, React.ReactNode> = {
    [FormSteps.CONFIRM]: (
      <Confirm
        confirmMessage={<>
          <b>
            <FullName {...partyName} />
          </b>, your{' '}
          <b>{formatUSDollars(paymentAmount)}{' '}
            {frequency.toLocaleLowerCase()}</b> auto
          payment scheduled for{' '}
          <b>{dayjs(nextActivityDate).format(DEFAULT_DATE_FORMAT)}</b> will be canceled. This may affect your
          policy. Are you sure you want to proceed?
        </>}
        confirmCallback={() => {
          mutation.mutate();
        }}
        denyCallback={handleClose}
        confirmTitle='Remove premium autopay?'
        confirmButtonText='Cancel autopay'
        confirmExpand />
    ),
    [FormSteps.SUCCESS]: (
      <Success
        closeCallback={handleClose}
        successTitle="Success"
        successMessage="Autopay has been canceled." />
    ),
    [FormSteps.ERROR]: (
      <Error
        errorTitle="We're sorry"
        errorMessage="Something went wrong. Please try again later."
        closeCallback={handleClose} />),
    [FormSteps.LOADING]: <Loading />,
  }

  return (
    <SideSheet
      overrideOpen={open}
      preventCloseOnOutsideClick={false}
      header="Cancel Autopay"
      trigger={
        <Button onClick={() => setOpen(true)} size="small" mode="link" disabled={disableButton}>
          Cancel Autopay
        </Button>
      }
    >
      {payorIsLoading || partyIdIsLoading ? <Loading /> : Views[viewState]}
    </SideSheet>
  );
};
