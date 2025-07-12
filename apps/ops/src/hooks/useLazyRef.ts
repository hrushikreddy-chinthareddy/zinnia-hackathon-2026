import { MutableRefObject, useRef } from 'react';

const useLazyRef = <T>(initialValFunc: () => T) => {
    const ref = useRef<T | null>(null);
    if (ref.current === null) {
        ref.current = initialValFunc();
    }
    return ref as MutableRefObject<T>;
};

export default useLazyRef;
