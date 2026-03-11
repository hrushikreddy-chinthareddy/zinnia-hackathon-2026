import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { FindAllKeyValuesFeatureSidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-feature-sidesheet';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { PolicyFeature } from '@zinnia/api-types/types/sor';

import {
    filterValidFeature,
    getFeatureNameText,
    getFeatureStatusText,
} from './features-table-helpers';
import styles from './features-table.module.css';
export default function FeaturesTable({
    policyDetails,
}: {
    policyDetails: PolicyDetails;
}) {
    const { t } = useTranslation();
    const features = policyDetails.features.all.filter(filterValidFeature);
    const [open, setOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] =
        useState<PolicyFeature | null>(null);
    const openSideSheet = (feature: PolicyFeature) => {
        setSelectedFeature(feature);
        setOpen(true);
    };
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('policy.extras.riders.riderName')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('policy.extras.riders.status')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('allFields.startDate')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('allFields.endDate')}
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!features?.length && (
                        <TableRow>
                            <TableCell
                                className={styles.noResultsTd}
                                colSpan={4}
                            >
                                {t('policy.extras.features.empty')}
                            </TableCell>
                        </TableRow>
                    )}
                    {features?.map((feature) => (
                        <TableRow key={`${feature.featureId}`}>
                            <TableCell>
                                <Button
                                    className={styles.tableButton}
                                    mode="link"
                                    size="small"
                                    onClick={() => {
                                        openSideSheet(feature);
                                    }}
                                >
                                    {getFeatureNameText(feature, t)}
                                </Button>
                            </TableCell>
                            <TableCell>
                                {getFeatureStatusText(feature, t)}
                            </TableCell>
                            <TableCell>
                                {convertKebabedDateString(feature.startDate)}
                            </TableCell>
                            <TableCell>
                                {convertKebabedDateString(feature.endDate)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <FindAllKeyValuesFeatureSidesheet
                open={open}
                onOpenChange={setOpen}
                policyDetails={policyDetails}
                feature={selectedFeature}
            />
        </>
    );
}
