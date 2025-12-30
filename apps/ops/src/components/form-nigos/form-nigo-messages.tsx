import { useTranslation } from 'next-i18next';

import CardContainer from '@deps/containers/card-container/card-container';
import {
    ExceptionSubRef,
    NigoExceptionResponse,
} from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import { FormNigos, NigoMessages } from '@deps/models/case/withdrawal/case';

import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import Typography, { TypographyVariant } from '../typography/typography';

interface FormNigoMessagesProps {
    nigoExceptions: NigoExceptionResponse[];
    formNigos: FormNigos | null;
}

function getFilteredSubExceptions(
    nigoExceptions: NigoExceptionResponse[],
    formNigosList: NigoMessages[]
) {
    if (!nigoExceptions || !formNigosList || formNigosList.length === 0) {
        return [];
    }
    const exceptionMap = formNigosList.reduce((acc, curr) => {
        acc[curr.exceptionId] = curr.messages;
        return acc;
    }, {} as Record<string, string[]>);
    return nigoExceptions
        .filter((exception) =>
            Object.prototype.hasOwnProperty.call(exceptionMap, exception.nmId)
        )
        .flatMap((exception) =>
            exception.exceptionSubRefs.filter((sub) =>
                exceptionMap[exception.nmId].includes(sub.subNmId)
            )
        );
}

const FormNigoMessages = ({
    nigoExceptions,
    formNigos,
}: FormNigoMessagesProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'site.pageTitles',
    });
    const exceptions = getFilteredSubExceptions(
        nigoExceptions,
        formNigos?.nigos ?? []
    );
    return (
        <CardContainer
            containerClassNames="border-b-2 border-gray-100"
            classNames="w-full"
        >
            <Typography
                variant={TypographyVariant.H3}
                className="mb-4"
                data-testid="title"
            >
                {t(`nigoSelected`)}
            </Typography>
            {exceptions.map((exception: ExceptionSubRef) => {
                return (
                    <CheckboxText
                        label={exception.subNmIdDetail}
                        checked={true}
                        onChange={() => {}}
                        isDisabled={true}
                        key={exception.subNmId}
                    />
                );
            })}
        </CardContainer>
    );
};

export default FormNigoMessages;
