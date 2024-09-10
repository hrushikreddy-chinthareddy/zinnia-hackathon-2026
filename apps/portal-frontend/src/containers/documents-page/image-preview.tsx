/* eslint-disable @next/next/no-img-element */
import React from 'react';

export default function ImagePreview({ documentBinary, fileExtension }: { documentBinary: string; fileExtension: string }) {
    return (
        <div
            className="mx-8 mt-8 h-screen w-screen print:hidden"
            onContextMenu={e => {
                e.preventDefault();
                console.error('cannot save image');
            }}
        >
            
            <img src={`data:image/${fileExtension};base64,${documentBinary}`} alt="document image" />
        </div>
    );
}
