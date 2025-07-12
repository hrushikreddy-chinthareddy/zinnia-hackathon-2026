import mitt, { EventType } from 'mitt';

import useLazyRef from './useLazyRef';

function useEmitter<T extends Record<EventType, unknown>>() {
    const emitterRef = useLazyRef(() => mitt<T>());
    return emitterRef.current;
}

export default useEmitter;
