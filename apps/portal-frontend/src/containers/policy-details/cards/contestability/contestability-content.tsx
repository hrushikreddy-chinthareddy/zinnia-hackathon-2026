import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { BASE_KEY, ContestabilityCardProps } from './contestability-card';

const ContestabilityContent: React.FC<ContestabilityCardProps> = ({ contestabilityCardData }) => {
    const { t } = useTranslation();

    return (
        <table className="-mx-8 mt-4 border-separate border-spacing-x-8 lg:ml-0">
            <caption className="sr-only">{t(`${BASE_KEY}contestability`)}</caption>
            <thead>
                <tr>
                    <th scope="col">
                        <Label label={t(`${BASE_KEY}startDate`)} variant={LabelVariant.FieldLabel} />
                    </th>
                    <th scope="col">
                        <Label label={t(`${BASE_KEY}endDate`)} variant={LabelVariant.FieldLabel} />
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <Content details={contestabilityCardData.startDate} variant={ContentVariant.BodySm} />
                    </td>
                    <td>
                        <Content details={contestabilityCardData.endDate || DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

export default ContestabilityContent;
