import { useTranslation } from 'next-i18next';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { TranslationFiles } from '@deps/config/translations';

import EditProgram from './edit-program';

const SswOperations = ({ programs, setSswUpdateView, programType, onProgramUpdate }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <div className="p-8">
            <label className="font-primary text-lg font-bold mb-5 ml-8">{t(`sswUpdate.${programType}`)}</label>
            {programs?.map((item: Program, index: number) => (
                <EditProgram key={index} program={item} onTerminate={onProgramUpdate} onEdit={setSswUpdateView} />
            ))}
        </div>
    );
};

export default SswOperations;
