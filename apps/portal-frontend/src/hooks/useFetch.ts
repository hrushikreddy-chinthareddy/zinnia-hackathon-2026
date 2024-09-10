import { useState, useEffect } from 'react';

// TODO - get this to work
const useFetch = (url: string, method: string, initialBody: object | null = null) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [body, setBody] = useState(initialBody);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: initialBody ? JSON.stringify(initialBody) : null,
                });
                const json = await res.json();
                setData(json);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body]);

    return { data, error, loading, setBody };
};

export default useFetch;
