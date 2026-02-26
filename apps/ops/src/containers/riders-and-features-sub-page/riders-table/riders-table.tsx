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

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { toSentenceCase } from '@deps/utils/strings';
import { Rider } from '@zinnia/api-types/types/sor';

import { getRiderInsured, getRiderStatusText } from './riders-table-helpers';
import styles from './riders-table.module.css';

export default function RidersTable({
    policyDetails,
}: {
    policyDetails: PolicyDetails;
}) {
    const { t } = useTranslation();
    const riders = policyDetails.riders;

    const openSideSheet = (_rider: Rider) => {};
    return (
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
                        {t('policy.extras.riders.effectiveDate')}
                    </TableHeaderCell>
                    <TableHeaderCell className="typography-content-body-sm-bold">
                        {t('policy.extras.riders.expirationDate')}
                    </TableHeaderCell>
                    <TableHeaderCell className="typography-content-body-sm-bold">
                        {t('policy.extras.riders.insured')}
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!riders?.length && (
                    <TableRow>
                        <TableCell className={styles.noResultsTd} colSpan={5}>
                            {t('policy.extras.riders.empty')}
                        </TableCell>
                    </TableRow>
                )}
                {riders?.map((rider) => (
                    <TableRow key={`${rider.riderName}-${rider.riderCode}`}>
                        <TableCell>
                            <Button
                                mode="link"
                                size="small"
                                onClick={() => {
                                    openSideSheet(rider);
                                }}
                            >
                                {toSentenceCase(rider.riderName ?? '')}
                            </Button>
                        </TableCell>
                        <TableCell>{getRiderStatusText(rider, t)}</TableCell>
                        <TableCell>
                            {convertKebabedDateString(
                                rider.effectiveDate ?? ''
                            )}
                        </TableCell>
                        <TableCell>
                            {convertKebabedDateString(
                                rider.terminationDate ?? ''
                            )}
                        </TableCell>
                        <TableCell>
                            {getRiderInsured(policyDetails, rider).map(
                                (insured) => (
                                    <PiiWrapper key={insured.partyId}>
                                        {insured.href ? (
                                            <NavElement
                                                href={insured.href}
                                                size={NavElementSize.Small}
                                                type={NavElementType.Link}
                                            >
                                                <PiiWrapper>
                                                    {insured.name}
                                                </PiiWrapper>
                                            </NavElement>
                                        ) : (
                                            insured.name
                                        )}
                                    </PiiWrapper>
                                )
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
