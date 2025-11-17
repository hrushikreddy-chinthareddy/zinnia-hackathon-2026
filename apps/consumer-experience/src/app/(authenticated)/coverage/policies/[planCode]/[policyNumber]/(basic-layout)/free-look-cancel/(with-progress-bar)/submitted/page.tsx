import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { Submission } from '@/components/stepped-workflow/workflows/free-look-cancel/forms/Submitted';

export default async function FreeLookCancelInformation() {
  return <Submission lineOfBusiness={LineOfBusiness.LIFE} />;
}
