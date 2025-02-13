import { Loader } from '@zinnia/bloom/components';
import React from 'react';

interface CustomLoaderProps {
    size?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ size = '20px' }) => {
    return (
        <div
            style={
                {
                    '--loader-size': size,
                } as React.CSSProperties
            }
        >
            <Loader />
        </div>
    );
};

export default CustomLoader;
