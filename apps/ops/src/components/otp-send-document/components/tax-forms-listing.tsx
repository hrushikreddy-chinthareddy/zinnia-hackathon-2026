import { Table, TableHeader, TableHeaderCell, TableRow, TableBody, TableCell } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TaxForm } from '@deps/models/case/send-tax-forms';
type TaxFormsListingProps = {
    taxForms: TaxForm[];
};

const TaxFormsListing = ({ taxForms }: TaxFormsListingProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: '' });

    return (
        <>
            {taxForms?.length > 0 ? (
                <>
                    <Content details={t('contactCenter.taxFormDetails.title') as string} variant={ContentVariant.BodyBold} />
                    <Table className="my-4">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.sendTaxForms.taxFormDetails.documentType') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>

                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.sendTaxForms.taxFormDetails.periodYear') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.sendTaxForms.taxFormDetails.actions') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {taxForms?.map((form, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Content details={form.name} variant={ContentVariant.BodySm} />
                                    </TableCell>

                                    <TableCell>
                                        <Content details={form.taxYear || ''} variant={ContentVariant.BodySm} />
                                    </TableCell>

                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <PiiWrapper className="mt-4">
                        <span>{t('contactCenter.taxFormDetails.warning.0')}</span>{' '}
                        <span>{t('contactCenter.taxFormDetails.warning.1')}</span>
                    </PiiWrapper>
                </>
            ) : (
                <Content details={t('contactCenter.sendTaxForms.taxFormDetails.noTaxForms') as string} variant={ContentVariant.BodySm} />
            )}
        </>
    );
};

export default TaxFormsListing;
