import { TFunction } from 'i18next';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormProgram } from '@deps/models/case/withdrawal/case';

import CheckboxText from '../checkbox/checkbox-text/checkbox-text';

interface HasPreviousNigoProps {
    isFormStateReadOnly: boolean;
    t: TFunction;
    isNigoChecked: boolean;
    onIsNigoChange: React.Dispatch<React.SetStateAction<FormProgram>>;
}

const HasPreviousNigo = ({
    isFormStateReadOnly,
    t,
    isNigoChecked,
    onIsNigoChange,
}: HasPreviousNigoProps) => {
    return (
        <CardContainer
            containerClassNames="border-b-2 border-gray-100"
            classNames="w-full"
        >
            <div className="flex-1 mt-5">
                <CheckboxText
                    label={t('hasPreviousNigo')}
                    checked={isNigoChecked}
                    onChange={() =>
                        onIsNigoChange((pv) => ({
                            ...pv,
                            isPrevNigoChecked: !pv?.isPrevNigoChecked,
                        }))
                    }
                    isDisabled={isFormStateReadOnly}
                />
            </div>
        </CardContainer>
    );
};

export default HasPreviousNigo;
