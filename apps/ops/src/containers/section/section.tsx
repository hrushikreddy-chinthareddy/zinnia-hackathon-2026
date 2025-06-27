import { ReactNode } from 'react';

interface SectionProps {
    classNames?: string;
    children: ReactNode;
    testid?: string;
}

const Section = ({ classNames, children, testid }: SectionProps) => {
    return (
        <section data-testid={testid} className={`mt-4 w-full ${classNames}`}>
            {children}
        </section>
    );
};

export default Section;
