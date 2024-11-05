import { useTranslation } from 'next-i18next';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit.svg';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
const EditProgram = ({ program, onTerminate }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    return (
        <div>
            <label className="font-primary text-lg font-bold my-2">{t(`sswUpdate.${program.programType}`)}</label>

            <div key={program.allocationId + 'in'} className="flex">
                <div className="my-2 grid grid-cols-auto-2 gap-2">
                    <Program program={program} isFormStateReadOnly={false} />
                </div>
                <div className="mt-3 p-8 text-primary flex">
                    <EditIcon
                        height={15}
                        width={20}
                        className="mx-2 cursor-pointer"
                        // onClick={() => setShowSSWEditTabs(!showSSWEditTabs)}
                    />
                    <TrashIcon height={15} width={20} className="mx-2 cursor-pointer" onClick={() => onTerminate(program)} />
                </div>
            </div>
        </div>
    );
};

export default EditProgram;
