import { useTranslation } from 'next-i18next';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { TranslationFiles } from '@deps/config/translations';
import { DocumentData } from '@deps/models/case/document';
import { FormSignature } from '@deps/models/case/withdrawal/case';

import EditProgram from './edit-program';
import { SswUpdateType } from '../ssw-edit-helper';

type SswOperationsProps = {
    document: DocumentData;
    programs: Program[];
    setSswUpdateView: React.Dispatch<boolean>;
    programType: SswUpdateType;
    onProgramUpdate: (item: Program, operationType: SswUpdateType, formSign: FormSignature) => void;
};

const SswOperations = ({ document, programs, setSswUpdateView, programType, onProgramUpdate }: SswOperationsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <div className="p-8">
            <label className="font-primary text-lg font-bold mb-5 ml-8">{t(`sswUpdate.${programType}`)}</label>
            {programs?.map((item: Program, index: number) => (
                <EditProgram key={index} program={item} onTerminate={onProgramUpdate} onEdit={setSswUpdateView} document={document} />
            ))}
        </div>
    );
};

export default SswOperations;
