import OftDlicForm from '@deps/containers/otp/oft-forms/dlic/dlic-oft-form';
import FlicOftWithdrawalForm from '@deps/containers/otp/oft-forms/flic/flic-oft-form';
import MassOftWithdrawalForm from '@deps/containers/otp/oft-forms/mass/mass-oft-form';
import RSLNOftWithdrawalForm from '@deps/containers/otp/oft-forms/rsln/rsln-oft-form';
import SbgcOftWithdrawalForm from '@deps/containers/otp/oft-forms/sbgc/sbgc-oft-form';
import FlicRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/flic-rmd-form';
import MassMutualRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/mm-rmd-form';
import SbgcRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/sbgc-rmd-form';
import { FlicSSWForm } from '@deps/containers/otp/ssw-forms/flic/flic-ssw-form';
import { MassMutualSSWForm } from '@deps/containers/otp/ssw-forms/mass/mass-ssw-form';
import { NassauSSWForm } from '@deps/containers/otp/ssw-forms/nasu/nasu-ssw-form';
import { SbgcSSWForm } from '@deps/containers/otp/ssw-forms/sbgc/sbgc-ssw-form';
import DlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/dlic/dlic-withdrawal-form';
import FlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form';
import GdmnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/gdmn/gdmn-withdrawal-form';
import GilicoWithdrawalForm from '@deps/containers/otp/withdrawal-forms/gilico/gilico-withdrawal-form';
import MassWithdrawalForm from '@deps/containers/otp/withdrawal-forms/mass/mass-withdrawal-form';
import NasuWithdrawalForm from '@deps/containers/otp/withdrawal-forms/nasu/nasu-withdrawal-form';
import RslnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/rsln/rsln-withdrawal-form';
import SbgcWithdrawalForm from '@deps/containers/otp/withdrawal-forms/sbgc-withdrawal-form';
import UlpcWithdrawalForm from '@deps/containers/otp/withdrawal-forms/ulpc/ulpc-withdrawal-form';
import { determineFormToRender } from '@deps/helpers/form-selector.helper';
import { CaseType } from '@deps/models/case/case';
import { DocumentType } from '@deps/models/case/document';
import { caseTypes } from '@deps/models/case/helpers';
import { QualTypes, Carrier } from '@deps/models/case/withdrawal/case';

export const getCaseType = (docTypeQuery: string): CaseType => {
    const loweredKeyedObj = Object.keys(caseTypes).reduce((acc, docTypeKey) => {
        acc[docTypeKey.toLowerCase()] = caseTypes[docTypeKey as DocumentType];
        return acc;
    }, {} as { [key: string]: CaseType });

    return loweredKeyedObj[docTypeQuery?.toLowerCase()];
};


export const getWithdrawalFormComponentMap = (qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicWithdrawalForm />,
    [Carrier.SBGC]: <SbgcWithdrawalForm />,
    [Carrier.DLIC]: <DlicWithdrawalForm />,
    [Carrier.MASS]: <MassWithdrawalForm qualType={qualType} />,
    [Carrier.NASU]: <NasuWithdrawalForm />,
    [Carrier.GDMN]: <GdmnWithdrawalForm />,
    [Carrier.RSLN]: <RslnWithdrawalForm />,
    [Carrier.ULPC]: <UlpcWithdrawalForm />,
    [Carrier.GLCO]: <GilicoWithdrawalForm />,
});

export const getOFTFormComponentMap = (planCode: string | '', qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicOftWithdrawalForm />,
    [Carrier.MASS]: <MassOftWithdrawalForm />,
    [Carrier.SBGC]: <SbgcOftWithdrawalForm planCode={planCode} />,
    [Carrier.DLIC]: <OftDlicForm qualType={qualType} />,
    [Carrier.RSLN]: <RSLNOftWithdrawalForm qualType={qualType} />,
});

export const getRMDFormComponentMap = (qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicRmdWithdrawalForm />,
    [Carrier.MASS]: <MassMutualRmdWithdrawalForm qualType={qualType} />,
    [Carrier.SBGC]: <SbgcRmdWithdrawalForm />,
});

const getSSWFormComponentMap = (qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.SBGC]: <SbgcSSWForm />,
    [Carrier.MASS]: <MassMutualSSWForm qualType={qualType} />,
    [Carrier.NASU]: <NassauSSWForm />,
    [Carrier.FLIC]: <FlicSSWForm qualType={qualType} />,
});

export const getFormParts = (caseType: CaseType, clientCode: string,qualType: QualTypes | '', planCode: string = '') => {
    let formParts;
    switch (caseType) {
        case CaseType.Withdrawal:
            formParts = determineFormToRender(clientCode , getWithdrawalFormComponentMap(qualType));
            break;
        case CaseType.Oft:
            formParts = determineFormToRender(clientCode, getOFTFormComponentMap(planCode, qualType));
            break;
        case CaseType.SSW:
            formParts = determineFormToRender(clientCode , getSSWFormComponentMap(qualType));
            break;
        case CaseType.Rmd:
            formParts = determineFormToRender(clientCode , getRMDFormComponentMap(qualType));
            break;
    }
    return formParts;
};