import { FieldTemplateProps } from '@rjsf/utils';

type PartyCardFieldTemplateProps = FieldTemplateProps & {
    properties: any[];
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
