import React from 'react';

import {
    AvatarSize,
    getAvatarSizeClass,
    getInitials,
    BG_CLASS,
} from './avatar.helpers';
import style from './avatar.module.css';

export interface AvatarProps {
    name: string;
    size?: AvatarSize;
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    size = 'small',
    name = '',
    className,
}) => {
    const sizeClass = getAvatarSizeClass(size);
    const initials = getInitials(name);

    return (
        <div
            className={`${style['avatar-base']} ${style[BG_CLASS]} ${
                style[sizeClass]
            } ${className ?? ''}`}
        >
            {initials}
        </div>
    );
};

export default Avatar;
