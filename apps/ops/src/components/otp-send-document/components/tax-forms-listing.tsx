import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableBody,
    TableCell,
    Tooltip,
    TooltipPlacement,
    Checkbox,
} from '@zinnia/bloom/components';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TaxForm } from '@deps/models/case/send-tax-forms';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

const toggleFormSelection = (selectedForm: TaxForm, setSelected: React.Dispatch<React.SetStateAction<TaxForm[]>>) => {
    setSelected(prevForms => {
        const hasForm = prevForms.find(existingForm => existingForm.formId === selectedForm.formId);
        if (hasForm) {
            return prevForms.filter(form => form.formId !== selectedForm.formId);
        }

        if (!hasForm) {
            return [...prevForms, selectedForm];
        }

        return prevForms || [];
    });
};

type TaxFormsListingProps = {
    taxForms: TaxForm[];
    carrierCode: string;
    selectedTaxForms: TaxForm[];
    setSelectedTaxForms: (selectedTaxForms: TaxForm[]) => void;
};

const TaxFormsListing = ({ taxForms, carrierCode, selectedTaxForms, setSelectedTaxForms }: TaxFormsListingProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: '' });
    const [selected, setSelected] = useState(selectedTaxForms || []);
    const setCookies = (form: TaxForm) => {
        setCookie('carrierCode', carrierCode);
        setCookie('contractNumber', form?.contractNumber);
        setCookie('fChar', form?.fChar);
        setCookie('taxYear', form?.taxYear);
    };

    useEffect(() => {
        setSelectedTaxForms(selected);
    }, [selected]);

    const isChecked = (formId: string): boolean => {
        return !!selected?.find(taxForm => taxForm.formId === formId);
    };

    return (
        <>
            {taxForms?.length > 0 ? (
                <>
                    <Content details={t('contactCenter.sendTaxForms.taxFormDetails.title') as string} variant={ContentVariant.BodyBold} />
                    <Table className="my-4">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>
                                    <></>
                                </TableHeaderCell>
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
                                    <TableHeaderCell>
                                        <Checkbox
                                            id={form.formId}
                                            onClick={() => toggleFormSelection(form, setSelected)}
                                            isCheckedByDefault={isChecked(form.formId)}
                                        />
                                    </TableHeaderCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Content details={form.name} variant={ContentVariant.BodySm} />
                                            <Tooltip
                                                placement={TooltipPlacement.TopRight}
                                                trigger={
                                                    <CircleInfoIcon
                                                        onClick={e => e.preventDefault()}
                                                        height={'16px'}
                                                        width={'16px'}
                                                        className="text-primary"
                                                    />
                                                }
                                            >
                                                {t(
                                                    `contactCenter.sendTaxForms.taxFormDetails.popover.${form.name
                                                        ?.split('-')
                                                        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                                                        .join('')}`
                                                )}
                                            </Tooltip>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Content details={form.taxYear || ''} variant={ContentVariant.BodySm} />
                                    </TableCell>

                                    <TableCell>
                                        <NavElement
                                            className={''}
                                            href={`/contact-center/document/tax-forms/${form?.formId}`}
                                            isNewPage={false}
                                            size={NavElementSize.Small}
                                            target="_blank"
                                            title={`${t('sendDocument.formSelection.view')} `}
                                            type={NavElementType.Link}
                                            variant={NavElementVariant.Secondary}
                                            onClick={() => setCookies(form)}
                                        >
                                            {t('sendDocument.formSelection.view')}
                                        </NavElement>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <PiiWrapper className="mt-4">
                        <span>{t('contactCenter.sendTaxForms.taxFormDetails.warning.0')}</span>{' '}
                        <span className="font-semibold">{t('contactCenter.sendTaxForms.taxFormDetails.warning.1')}</span>
                    </PiiWrapper>
                </>
            ) : (
                <Content details={t('contactCenter.sendTaxForms.taxFormDetails.noTaxForms') as string} variant={ContentVariant.BodySm} />
            )}
        </>
    );
};

export default TaxFormsListing;
