import React from 'react';

export default function NextImageStub({ src, alt, ...props }: any) {
    return React.createElement('img', { src: src || 'placeholder', alt, ...props });
}
