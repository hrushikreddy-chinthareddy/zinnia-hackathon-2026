import React from 'react';

import { AvatarSize, getAvatarSizeClass, getInitials, BG_CLASS } from './avatar.helper';
import style from './avatar.module.css';

export interface AvatarProps {
    name: string;
    size?: AvatarSize;
}

const Avatar: React.FC<AvatarProps> = ({ size = 'small', name = '' }) => {
    const sizeClass = getAvatarSizeClass(size);
    const initials = getInitials(name);

    return <div className={`${style['avatar-base']} ${style[BG_CLASS]} ${style[sizeClass]}`}>{initials}</div>;
};

export default Avatar;
