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

import { FindAllKeyValuesRiderSidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-riders-sidesheet';
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

export default function RidersTable({
    policyDetails,
}: {
    policyDetails: PolicyDetails;
}) {
    const { t } = useTranslation();
    const riders = policyDetails.riders;
    const [open, setOpen] = useState(false);
    const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

    const openSideSheet = (rider: Rider) => {
        setSelectedRider(rider);
        setOpen(true);
    };
    return (
        <>
            <Table>
                <TableHeader>
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
                </TableHeader>
                <TableBody>
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
                            <TableCell>
                                {getRiderStatusText(rider, t)}
                            </TableCell>
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
            <FindAllKeyValuesRiderSidesheet
                open={open}
                onOpenChange={setOpen}
                policyDetails={policyDetails}
                rider={selectedRider}
            />
        </>
    );
}
