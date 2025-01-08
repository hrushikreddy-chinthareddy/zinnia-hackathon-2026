import { ObjectFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
function InstructionsTemplate(props: ObjectFieldTemplateProps) {
    const { title, uiSchema } = props;

    const description = uiSchema?.props?.description;
    return (
        <div className={clsx('responsive-padding flex grow flex-col gap-2 bg-gray-50')}>
            <div className="flex flex-col gap-2">
                <Typography data-testid="workflow-card-title" variant={TypographyVariant.BodyBold}>
                    {title}
                </Typography>
                {!!description && <Typography variant={TypographyVariant.Body}>{description}</Typography>}
            </div>
        </div>
    );
}

export default InstructionsTemplate;
