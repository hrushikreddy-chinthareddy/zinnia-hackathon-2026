import OftDlicForm from '@deps/containers/otp/oft-forms/dlic/dlic-oft-form';
import FlicOftWithdrawalForm from '@deps/containers/otp/oft-forms/flic/flic-oft-form';
import GdmnOftWithdrawalForm from '@deps/containers/otp/oft-forms/gdmn/gdmn-oft-form';
import GlcoOftWithdrawalForm from '@deps/containers/otp/oft-forms/gilico/glco-oft-form';
import MassOftWithdrawalForm from '@deps/containers/otp/oft-forms/mass/mass-oft-form';
import NasuOftWithdrawalForm from '@deps/containers/otp/oft-forms/nasu/nasu-oft-form';
import PrdnOftWithdrawalForm from '@deps/containers/otp/oft-forms/prdn/prdn-oft-form';
import RSLNOftWithdrawalForm from '@deps/containers/otp/oft-forms/rsln/rsln-oft-form';
import SbgcOftWithdrawalForm from '@deps/containers/otp/oft-forms/sbgc/sbgc-oft-form';
import UlpcOftWithdrawalForm from '@deps/containers/otp/oft-forms/ulpc/ulpc-oft-form';
import UsaaOftWithdrawalForm from '@deps/containers/otp/oft-forms/usaa/usaa-oft-form';
import DlicRenewalForm from '@deps/containers/otp/renewal-forms/dlic-form';
import GlcoRenewalForm from '@deps/containers/otp/renewal-forms/glco/glco-form';
import MassRenewalForm from '@deps/containers/otp/renewal-forms/mass-mutual-form';
import SbgcRenewalForm from '@deps/containers/otp/renewal-forms/sbgc-form';
import UlpcRenewalForm from '@deps/containers/otp/renewal-forms/ulpc/ulpc-form';
import DlicRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/dlic/dlic-rmd-form';
import FlicRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/flic-rmd-form';
import GdmnRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/gdmn/gdmn-rmd-form';
import GlcoRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/glco-rmd-form';
import MassMutualRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/mm-rmd-form';
import NasuRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/nasu/nasu-rmd-form';
import PrdnRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/prdn/prdn-rmd-form';
import RslnRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/rsln/rsln-rmd-form';
import SbgcRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/sbgc-rmd-form';
import UlpcRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/ulpc/ulpc-rmd-form';
import UsaaRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/usaa/usaa-rmd-form';
import { DlicSSWForm } from '@deps/containers/otp/ssw-forms/dlic/dlic-ssw-form';
import { FlicSSWForm } from '@deps/containers/otp/ssw-forms/flic/flic-ssw-form';
import { GdmnSSWForm } from '@deps/containers/otp/ssw-forms/gdmn/gdmn-ssw-form';
import { GlcoSSWForm } from '@deps/containers/otp/ssw-forms/glco/glco-ssw-form';
import { MassMutualSSWForm } from '@deps/containers/otp/ssw-forms/mass/mass-ssw-form';
import { NassauSSWForm } from '@deps/containers/otp/ssw-forms/nasu/nasu-ssw-form';
import { PrdnSSWForm } from '@deps/containers/otp/ssw-forms/prdn/prdn-ssw-form';
import { RslnSSWForm } from '@deps/containers/otp/ssw-forms/rsln/rsln-ssw-form';
import { SbgcSSWForm } from '@deps/containers/otp/ssw-forms/sbgc/sbgc-ssw-form';
import { UlpcSSWForm } from '@deps/containers/otp/ssw-forms/ulpc/ulpc-ssw-form';
import { UsaaSSWForm } from '@deps/containers/otp/ssw-forms/usaa/usaa-ssw-form';
import DlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/dlic/dlic-withdrawal-form';
import FlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form';
import GdmnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/gdmn/gdmn-withdrawal-form';
import GilicoWithdrawalForm from '@deps/containers/otp/withdrawal-forms/gilico/gilico-withdrawal-form';
import MassWithdrawalForm from '@deps/containers/otp/withdrawal-forms/mass/mass-withdrawal-form';
import NasuWithdrawalForm from '@deps/containers/otp/withdrawal-forms/nasu/nasu-withdrawal-form';
import RslnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/rsln/rsln-withdrawal-form';
import SbgcWithdrawalForm from '@deps/containers/otp/withdrawal-forms/sbgc-withdrawal-form';
import UlpcWithdrawalForm from '@deps/containers/otp/withdrawal-forms/ulpc/ulpc-withdrawal-form';
import UsaaWithdrawalForm from '@deps/containers/otp/withdrawal-forms/usaa/usaa-withdrawal-form';
import { determineFormToRender } from '@deps/helpers/form-selector.helpers';
import { CaseType } from '@deps/models/case/case';
import { DocumentType } from '@deps/models/case/document';
import { caseTypes } from '@deps/models/case/helpers';
import {
    QualTypes,
    Carrier,
    FASTQualTypes,
} from '@deps/models/case/withdrawal/case';

export const getCaseType = (docTypeQuery: string): CaseType => {
    const loweredKeyedObj = Object.keys(caseTypes).reduce((acc, docTypeKey) => {
        acc[docTypeKey.toLowerCase()] = caseTypes[docTypeKey as DocumentType];
        return acc;
    }, {} as { [key: string]: CaseType });

    return loweredKeyedObj[docTypeQuery?.toLowerCase()];
};

export const getWithdrawalFormComponentMap = (
    planCode: string | '',
    qualType: QualTypes | FASTQualTypes | '',
    isLC: boolean
): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicWithdrawalForm qualType={qualType} isLC={isLC} />,
    [Carrier.SBGC]: <SbgcWithdrawalForm />,
    [Carrier.DLIC]: <DlicWithdrawalForm planCode={planCode} />,
    [Carrier.MASS]: <MassWithdrawalForm qualType={qualType} />,
    [Carrier.NASU]: <NasuWithdrawalForm />,
    [Carrier.GDMN]: <GdmnWithdrawalForm />,
    [Carrier.RSLN]: <RslnWithdrawalForm />,
    [Carrier.ULPC]: <UlpcWithdrawalForm />,
    [Carrier.GLCO]: <GilicoWithdrawalForm qualType={qualType} />,
    [Carrier.USAA]: <UsaaWithdrawalForm />,
});

export const getOFTFormComponentMap = (
    planCode: string | '',
    qualType: QualTypes | ''
): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicOftWithdrawalForm qualType={qualType} />,
    [Carrier.MASS]: <MassOftWithdrawalForm />,
    [Carrier.SBGC]: <SbgcOftWithdrawalForm planCode={planCode} />,
    [Carrier.DLIC]: <OftDlicForm qualType={qualType} planCode={planCode} />,
    [Carrier.RSLN]: <RSLNOftWithdrawalForm qualType={qualType} />,
    [Carrier.GDMN]: <GdmnOftWithdrawalForm qualType={qualType} />,
    [Carrier.GLCO]: <GlcoOftWithdrawalForm />,
    [Carrier.USAA]: <UsaaOftWithdrawalForm />,
    [Carrier.NASU]: <NasuOftWithdrawalForm />,
    [Carrier.ULPC]: <UlpcOftWithdrawalForm />,
    [Carrier.PRDN]: <PrdnOftWithdrawalForm />,
});

export const getRMDFormComponentMap = (
    qualType: QualTypes | ''
): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicRmdWithdrawalForm />,
    [Carrier.MASS]: <MassMutualRmdWithdrawalForm qualType={qualType} />,
    [Carrier.SBGC]: <SbgcRmdWithdrawalForm />,
    [Carrier.GLCO]: <GlcoRmdWithdrawalForm />,
    [Carrier.ULPC]: <UlpcRmdWithdrawalForm />,
    [Carrier.RSLN]: <RslnRmdWithdrawalForm />,
    [Carrier.GDMN]: <GdmnRmdWithdrawalForm />,
    [Carrier.DLIC]: <DlicRmdWithdrawalForm />,
    [Carrier.USAA]: <UsaaRmdWithdrawalForm />,
    [Carrier.NASU]: <NasuRmdWithdrawalForm />,
    [Carrier.PRDN]: <PrdnRmdWithdrawalForm />,
});

const getSSWFormComponentMap = (
    qualType: QualTypes | '',
    planCode?: string
): Record<string, React.ReactNode> => ({
    [Carrier.SBGC]: <SbgcSSWForm />,
    [Carrier.MASS]: <MassMutualSSWForm qualType={qualType} />,
    [Carrier.NASU]: <NassauSSWForm />,
    [Carrier.FLIC]: <FlicSSWForm qualType={qualType} />,
    [Carrier.GLCO]: <GlcoSSWForm planCode={planCode} />,
    [Carrier.ULPC]: <UlpcSSWForm planCode={planCode} />,
    [Carrier.RSLN]: <RslnSSWForm />,
    [Carrier.PRDN]: <PrdnSSWForm />,
    [Carrier.GDMN]: <GdmnSSWForm />,
    [Carrier.USAA]: <UsaaSSWForm />,
    [Carrier.DLIC]: <DlicSSWForm planCode={planCode} />,
});

const getRenewalFormComponentMap = (): Record<string, React.ReactNode> => ({
    [Carrier.SBGC]: <SbgcRenewalForm />,
    [Carrier.MASS]: <MassRenewalForm />,
    [Carrier.DLIC]: <DlicRenewalForm />,
    [Carrier.ULPC]: <UlpcRenewalForm />,
    [Carrier.GLCO]: <GlcoRenewalForm />,
});

export const getFormParts = (
    caseType: CaseType,
    clientCode: string,
    qualType: QualTypes | FASTQualTypes | '',
    planCode: string = '',
    isLC: boolean = true
) => {
    let formParts;
    switch (caseType) {
        case CaseType.Withdrawal:
            formParts = determineFormToRender(
                clientCode,
                getWithdrawalFormComponentMap(planCode, qualType, isLC)
            );
            break;
        case CaseType.Oft:
            formParts = determineFormToRender(
                clientCode,
                getOFTFormComponentMap(planCode, qualType as QualTypes)
            );
            break;
        case CaseType.SSW:
            formParts = determineFormToRender(
                clientCode,
                getSSWFormComponentMap(qualType as QualTypes, planCode)
            );
            break;
        case CaseType.Rmd:
            formParts = determineFormToRender(
                clientCode,
                getRMDFormComponentMap(qualType as QualTypes)
            );
            break;
        case CaseType.Renewal:
            formParts = determineFormToRender(
                clientCode,
                getRenewalFormComponentMap()
            );
            break;
    }
    return formParts;
};
