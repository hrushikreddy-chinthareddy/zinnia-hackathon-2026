import { Icon, IconType } from '@zinnia/bloom/components';
import { useContext } from 'react';

import IconButton from '@deps/components/icon-button/icon-button';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { FormSignature } from '@deps/models/case/withdrawal/case';

import { signaturesConfig } from '../bank-update/bank-update.helper';
import { SswUpdateType } from '../ssw-edit-helper';

type EditProgramProps = {
    program: Program;
    onTerminate: (item: Program, operationType: SswUpdateType, formSign: FormSignature) => void;
    onEdit: (op: boolean) => void;
    document: DocumentData;
};

const EditProgram = ({ program, onTerminate, onEdit, document }: EditProgramProps) => {
    const { formSignature } = useContext(FormDataContext);
    return (
        <div>
            <div className="mx-8">
                <div key={program.allocationId + 'in'} className="flex">
                    <div className="my-2 grid grid-cols-auto-2 gap-2">
                        <Program program={program} isFormStateReadOnly={false} />
                    </div>
                    <div className="mt-2 p-8 text-primary flex">
                        <IconButton className="mx-2 " aria-describedby="edit-program" onClick={() => onEdit(true)}>
                            <Icon type={IconType.EDIT_ALT} height={20} width={20} />
                        </IconButton>
                        <IconButton
                            className="mx-2"
                            aria-describedby="delete-program"
                            onClick={() => onTerminate(program, SswUpdateType.PROGRAM_TERMINATE, formSignature)}
                        >
                            <Icon type={IconType.TRASH} height={20} width={20} />
                        </IconButton>
                    </div>
                </div>
            </div>

            {document.source === ChannelType.Email && formSignature && (
                <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
            )}
        </div>
    );
};

export default EditProgram;
