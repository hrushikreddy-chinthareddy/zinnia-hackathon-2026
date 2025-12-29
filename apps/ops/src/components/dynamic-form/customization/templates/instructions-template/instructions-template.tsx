import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import useNavLink from '@deps/hooks/useNavLink';

function InstructionsTemplate(props: ObjectFieldTemplateProps) {
    const { buildOpenInNewWindowLinkText } = useNavLink();
    const { title, uiSchema, formContext, description } = props;
    const { linkName, linkUrl } = getUiOptions(uiSchema);
    const { customData } = formContext;
    const resolvedUrl = replacePlaceholders(linkUrl, customData);

    return (
        <div
            className={clsx(
                'responsive-padding flex grow flex-col gap-2 bg-gray-50 my-4'
            )}
        >
            <div className="flex flex-col gap-2">
                {title && (
                    <Typography
                        data-testid="workflow-card-title"
                        variant={TypographyVariant.BodyBold}
                    >
                        {title}
                    </Typography>
                )}
                {!!description && (
                    <Typography variant={TypographyVariant.Body}>
                        {replacePlaceholders(description, formContext) ??
                            description}

                        {linkUrl && linkName && (
                            <>
                                &nbsp;
                                <Typography
                                    variant={TypographyVariant.NavLinks}
                                >
                                    <a
                                        href={resolvedUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={buildOpenInNewWindowLinkText(
                                            linkName as string
                                        )}
                                    >
                                        {linkName as string}
                                    </a>
                                </Typography>
                            </>
                        )}
                    </Typography>
                )}
            </div>
        </div>
    );
}

export default InstructionsTemplate;
