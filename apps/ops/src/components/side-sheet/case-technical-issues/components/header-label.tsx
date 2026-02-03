import { useEffect, useRef, useState } from 'react';

import Label, { LabelVariant } from '@deps/components/label/label';

import caseTechnicalIssuesStyles from '../case-technical-issues.module.css';

type HeaderLabelProps = {
    text: string;
};

export const HeaderLabel = ({ text }: HeaderLabelProps) => {
    const textRef = useRef<HTMLDivElement | null>(null);
    const [isMultiline, setIsMultiline] = useState(false);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => {
            const style = window.getComputedStyle(el);
            const lineHeight = parseFloat(style.lineHeight);

            setIsMultiline(el.clientHeight > lineHeight + 1);
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(el);

        return () => observer.disconnect();
    }, [text]);

    return (
        <div
            className={`${caseTechnicalIssuesStyles.headerLabel} ${
                isMultiline
                    ? caseTechnicalIssuesStyles.multiline
                    : caseTechnicalIssuesStyles.singleline
            }`}
        >
            <div ref={textRef} className={caseTechnicalIssuesStyles.headerText}>
                <Label label={text} variant={LabelVariant.LabelLg} />
            </div>
        </div>
    );
};
