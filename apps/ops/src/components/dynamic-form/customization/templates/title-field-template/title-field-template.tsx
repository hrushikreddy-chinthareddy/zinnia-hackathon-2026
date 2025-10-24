import { TitleFieldProps } from '@rjsf/utils';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { title, uiSchema } = props;
    const fontType = uiSchema?.['ui:options']?.fonttype as string;

    return (
        <Typography
            variant={
                fontType === 'title'
                    ? TypographyVariant.H3
                    : TypographyVariant.Body
            }
            className="my-2"
        >
            {title}
        </Typography>
    );
}
