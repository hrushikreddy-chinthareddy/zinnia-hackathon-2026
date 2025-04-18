import { ObjectFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';
function InstructionsTemplate(props: ObjectFieldTemplateProps) {
    const { title, uiSchema, formContext, description } = props;

    return (
        <div className={clsx('responsive-padding flex grow flex-col gap-2 bg-gray-50 my-4')}>
            <div className="flex flex-col gap-2">
                <Typography data-testid="workflow-card-title" variant={TypographyVariant.BodyBold}>
                    {title}
                </Typography>
                {!!description && (
                    <Typography variant={TypographyVariant.Body}>{replacePlaceholders(description, formContext) ?? description}</Typography>
                )}
            </div>
        </div>
    );
}

export default InstructionsTemplate;
