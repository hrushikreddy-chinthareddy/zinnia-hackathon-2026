import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { useState } from 'react';

export function AccordionTemplate(props: ObjectFieldTemplateProps) {
    const { title } = props;
    const [openSection, setOpenSection] = useState(true);

    return (
        <div className="accordion">
            <div className="accordion-item">
                <div className="accordion-header" onClick={() => setOpenSection(!openSection)}>
                    <h3>{title}</h3>
                </div>
                {openSection && (
                    <div className="accordion-body">
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
                )}
            </div>
        </div>
    );
}
