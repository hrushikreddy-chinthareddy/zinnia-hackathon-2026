import { getUiOptions, TitleFieldProps, UiSchema } from '@rjsf/utils';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { uiSchema } = props;
    const uiOptions = getUiOptions(uiSchema as UiSchema);

    const toTypographyVariant = (v: unknown): TypographyVariant => {
        if (
            typeof v === 'string' &&
            (Object.values(TypographyVariant) as string[]).includes(v)
        ) {
            return v as TypographyVariant;
        }
        return TypographyVariant.Label;
    };

    const variant = toTypographyVariant(uiOptions.titleVariant);

    const className = uiOptions.className;

    return (
        <Typography variant={variant} className={className as string}>
            {uiOptions.title ?? ''}
        </Typography>
    );
}
