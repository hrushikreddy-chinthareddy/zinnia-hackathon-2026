import { FieldTemplateProps, ObjectFieldTemplateProps } from '@rjsf/utils';

type PartyCardFieldTemplateProps = FieldTemplateProps & {
    properties: NonNullable<ObjectFieldTemplateProps['properties']>;
};

export function PartyCardFieldTemplate(props: PartyCardFieldTemplateProps) {
    const { properties } = props;
    return (
        <>
            <div className="p-2">
                {properties
                    .filter((p: any) => !p.hidden)
                    .map((p: any) => (
                        <div key={p.name}>{p.content}</div>
                    ))}
            </div>
        </>
    );
}
