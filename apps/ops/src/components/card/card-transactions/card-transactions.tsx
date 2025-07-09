import { useTranslation } from 'react-i18next';

import FieldData, {
    FieldDataProps,
    FieldDataVariant,
} from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PopoverPlacement } from '@deps/components/popover/popover';
import ResponsiveFlex from '@deps/components/responsive-flex/responsive-flex';
import {
    HorizontalResizing,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
    ItemPadding,
    VerticalResizing,
} from '@deps/components/responsive-flex/responsive-flex.types';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { JestProps } from '@deps/types/props';

export enum CardTransactionsTest {
    Container = 'card-transactions-container-test-id',
}

export type CardTransactionsProps = {
    title: string;
    premium: number;
    additionalChargesTitle: string;
    additionalCharges?: AdditionalCharge[];
    displayCardWithZeroAmount?: boolean;
} & JestProps;

export type AdditionalCharge = {
    amount: number | undefined;
    label: string;
    key?: string | number;
    displayCardWithZeroAmount?: boolean;
} & Omit<FieldDataProps, 'variant'>;

// Figma Element Names
const Container = ResponsiveFlex;
const TopContent = ResponsiveFlex;
const BottomContent = ResponsiveFlex;
const Content = ResponsiveFlex;

// all data rows on the page share the same prop
const ChargeItem = ({
    amount = 0,
    displayCardWithZeroAmount,
    ...props
}: AdditionalCharge) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'premium.upcoming',
    });
    return (
        <FieldData {...props} variant={FieldDataVariant.Information}>
            {!amount && displayCardWithZeroAmount
                ? t('pendingCalculation')
                : numberFormatify(amount)}
        </FieldData>
    );
};

const CardTransactions = ({
    title,
    additionalChargesTitle,
    additionalCharges,
    premium,
    displayCardWithZeroAmount,
    'data-testid': dataTestId,
}: CardTransactionsProps) => {
    const additionalTotal = additionalCharges
        ? additionalCharges?.reduce((acc, val) => (val?.amount || 0) + acc, 0)
        : 0;
    const total = premium + additionalTotal;

    return (
        <Container
            data-testid={dataTestId || CardTransactionsTest.Container}
            layoutDirection={LayoutDirection.Vertical}
            layoutAlignment={LayoutAlignment.TopLeft}
            verticalResizing={VerticalResizing.Hug}
            horizontalResizing={HorizontalResizing.Fixed}
            itemSpacing={ItemSpacing.None}
            className="w-72 rounded border-2 border-gray-100"
        >
            <TopContent
                layoutDirection={LayoutDirection.Horizontal}
                layoutAlignment={LayoutAlignment.MiddleEvenly}
                verticalResizing={VerticalResizing.Hug}
                horizontalResizing={HorizontalResizing.Fill}
                itemPadding={ItemPadding.XSmall}
            >
                <ChargeItem
                    label={title}
                    amount={total}
                    displayCardWithZeroAmount={displayCardWithZeroAmount}
                />
            </TopContent>
            {!!additionalCharges?.length && (
                <>
                    <hr className="w-full border-1 border-gray-100" />
                    <BottomContent
                        layoutDirection={LayoutDirection.Vertical}
                        layoutAlignment={LayoutAlignment.TopLeft}
                        verticalResizing={VerticalResizing.Fill}
                        horizontalResizing={HorizontalResizing.Fill}
                        itemPadding={ItemPadding.XSmall}
                        itemSpacing={ItemSpacing.XSmall}
                    >
                        <Label
                            label={additionalChargesTitle}
                            variant={LabelVariant.LabelSmAlt}
                        />
                        <Content
                            layoutDirection={LayoutDirection.Vertical}
                            layoutAlignment={LayoutAlignment.MiddleEvenly}
                            verticalResizing={VerticalResizing.Hug}
                            horizontalResizing={HorizontalResizing.Fill}
                            itemPadding={ItemPadding.None}
                            itemSpacing={ItemSpacing.None}
                        >
                            {additionalCharges.map(
                                ({ key, ...props }, index) => (
                                    <ChargeItem
                                        key={key || index}
                                        {...props}
                                        tooltipPlacement={
                                            PopoverPlacement.TopLeft
                                        }
                                        displayCardWithZeroAmount={
                                            displayCardWithZeroAmount
                                        }
                                    />
                                )
                            )}
                        </Content>
                    </BottomContent>
                </>
            )}
        </Container>
    );
};

export default CardTransactions;
