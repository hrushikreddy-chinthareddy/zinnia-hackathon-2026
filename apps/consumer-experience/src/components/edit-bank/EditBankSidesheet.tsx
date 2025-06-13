import { SideSheet, Button } from '@zinnia/bloom/components';

import { EditBank as FarmersEditBank } from '../farmers/payment-details/EditBank';

// @TODO: implement edit bank sidesheet
export const EditBankSidesheet = () => {
  return (
    <SideSheet
      header="Edit Payment Method"
      trigger={
        <Button size="small" mode="link">
          Edit
        </Button>
      }
    >
      {/* @TODO: add conditional check to only show this if current carrier is farmers */}
      <FarmersEditBank />
    </SideSheet>
  );
};
