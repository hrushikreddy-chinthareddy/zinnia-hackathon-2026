import { FieldTemplateProps } from '@rjsf/utils';
import { useEffect, useRef } from 'react';

type PartyCardFieldTemplateProps = FieldTemplateProps & {
    properties: any[];
};

export function PartyCardFieldTemplate(props: PartyCardFieldTemplateProps) {
    const { properties, formContext } = props;

    const deepEqual = (obj1: any, obj2: any): boolean => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    const prevFormContextRef = useRef(formContext);

    useEffect(() => {
        const prev = prevFormContextRef.current;
        const curr = formContext;
        if (!deepEqual(prev, curr)) {
            console.log(
                'PartyCardFieldTemplate formContext DEEP updated:',
                curr
            );
        }
        prevFormContextRef.current = curr;
    }, [formContext]);

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
