import { TitleFieldProps } from '@rjsf/utils';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';

export function TitleFieldTemplate(props: TitleFieldProps) {
    const { id, required, title } = props;
    return (
        <Typography variant={TypographyVariant.H4} className="mb-4" data-testid={`data-testid-${id}`}>
            <header id={id}>
                {title}
                {required && <mark>*</mark>}
            </header>
        </Typography>
    );
}
