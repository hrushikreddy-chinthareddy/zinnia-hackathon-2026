import { ObjectFieldTemplateProps } from '@rjsf/utils';

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    return (
        <div className="mb-2 my-8">
            <div className="my-4 typography-titles-subtitle">{props.title}</div>
            {props.description}
            <div className="my-0 px-0  w-full">
                {props.properties
                    .filter(element => element.hidden !== true)
                    .map(element => {
                        return (
                            <div key={element.name} className="property-wrapper flex flex-col">
                                {element.content}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
