import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { FormSignature } from '@deps/models/case/withdrawal/case';

import EditProgram from './edit-program';
import { signaturesConfig } from '../bank-update/bank-update.helper';
import { getDocumentSource, SswUpdateType } from '../ssw-edit-helper';

type SswOperationsProps = {
    document: DocumentData;
    programs: Program[];
    setSswUpdateView: React.Dispatch<boolean>;
    programType: SswUpdateType;
    onProgramUpdate: (item: Program, operationType: SswUpdateType, formSign: FormSignature) => void;
    setSelectedProgram: React.Dispatch<Program>;
};

const SswOperations = ({ document, programs, setSswUpdateView, programType, onProgramUpdate, setSelectedProgram }: SswOperationsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { formSignature } = useContext(FormDataContext);
    const source = getDocumentSource(document.documentNumber);

    const handleEditProgram = (index: number): undefined => {
        setSelectedProgram(programs[index]);
        setSswUpdateView(true);
    };

    return (
        <div className="p-8">
            <label className="font-primary text-lg font-bold mb-5 ml-8">{t(`sswUpdate.${programType}`)}</label>
            {programs?.map((item: Program, index: number) => (
                <EditProgram key={index} program={item} onTerminate={onProgramUpdate} onEdit={handleEditProgram} programIndex={index} />
            ))}
            {source !== ChannelType.Phone && formSignature && (
                <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
            )}
        </div>
    );
};

export default SswOperations;
