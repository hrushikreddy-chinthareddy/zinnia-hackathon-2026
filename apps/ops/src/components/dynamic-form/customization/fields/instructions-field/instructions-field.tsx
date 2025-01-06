import { FieldProps } from '@rjsf/utils';
import clsx from 'clsx';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';

export function InstructionsField(props: FieldProps) {
    const { title, subTitle } = props.schema;

    return (
        <div className={clsx('responsive-padding flex grow flex-col gap-2 bg-gray-50')}>
            <div className="flex flex-col gap-2">
                <Typography data-testid="workflow-card-title" variant={TypographyVariant.BodyBold}>
                    {title}
                </Typography>
                {!!subTitle && <Typography variant={TypographyVariant.Body}>{subTitle}</Typography>}
            </div>
        </div>
    );
}
