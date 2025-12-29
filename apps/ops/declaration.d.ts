declare module '*.jpg';
declare module '*.jpeg';
declare module 'pdfjs-dist/build/pdf.worker.entry';
declare module 'mime';
declare module '*.svg' {
    const ReactComponent: React.FC<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    const content: string;

    export { ReactComponent };
    export default content;
}
