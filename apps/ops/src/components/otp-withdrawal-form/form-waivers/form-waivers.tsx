import { useTranslation } from 'next-i18next';
import { useCallback, useContext } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    FormAdditionalWaiver,
    PolicyWaiver,
} from '@deps/models/case/withdrawal/case';

import { FormWaiverItem, StatusData } from './form-waiver-item';

export type WaiverItemConfig = {
    id: PolicyWaiver;
    title: string;
    optionTitle: string;
    options: { label: string; value: string }[];
};

export type FormWaiverConfig = {
    config: WaiverItemConfig[];
    isFormStateReadOnly?: boolean;
};

const FormWaivers = ({ config, isFormStateReadOnly }: FormWaiverConfig) => {
    const { formAdditionalWaivers, setFormAdditionalWaivers } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.additionalWaivers',
    });

    const onChangeHandler = useCallback(
        (data: StatusData) => {
            if (!data || !data.action) return;
            const newItem: FormAdditionalWaiver = {
                text: data.text,
                selectionOptions: data.selectionOptions,
            };
            switch (data.action) {
                case 'ADD':
                    setFormAdditionalWaivers((ps) => {
                        if (!ps) return [newItem];

                        const existingItemIndex = ps.findIndex(
                            (item) => item.text === newItem.text
                        );
                        if (existingItemIndex !== -1) {
                            return ps.map((item, index) =>
                                index === existingItemIndex ? newItem : item
                            );
                        } else {
                            return [...ps, newItem];
                        }
                    });
                    break;
                case 'REMOVE':
                    setFormAdditionalWaivers(
                        (ps) =>
                            ps?.filter((rec) => rec.text !== data.text) ?? ps
                    );
                    break;
                default:
                    break;
            }
        },
        [setFormAdditionalWaivers]
    );

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3}>{t('title')}</Typography>
            <div className="mt-4">
                {config.map((item) => (
                    <FormWaiverItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        optionTitle={item.optionTitle}
                        options={item.options}
                        selectedOption={
                            formAdditionalWaivers?.find(
                                (rec) => rec.text == item.id
                            )?.selectionOptions
                        }
                        onChange={onChangeHandler}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                ))}
            </div>
        </CardContainer>
    );
};

export default FormWaivers;
