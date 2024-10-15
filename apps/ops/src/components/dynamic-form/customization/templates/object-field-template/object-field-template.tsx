import { ObjectFieldTemplateProps } from '@rjsf/utils';

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    return (
        <div className="mb-2">
            {props.title}
            {props.description}
            {/* <div className="my-4 grid w-full grid-cols-3 gap-2"> */}
            {props.properties
                .filter(element => element.hidden !== true)
                .map(element => {
                    return (
                        <div key={element.name} className="property-wrapper flex flex-col">
                            {element.content}
                        </div>
                    );
                })}
            {/* </div> */}
        </div>
    );
}

export function GridObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    return (
        <div>
            {props.title}
            {props.description}
            <div className="my-4 grid w-full grid-cols-3 gap-2">
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

export function GridObjectFieldTemplate5(props: ObjectFieldTemplateProps) {
    return (
        <div>
            {props.title}
            {props.description}
            <div className="my-4 grid w-full grid-cols-5 gap-2">
                {props.properties.map(element => {
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
