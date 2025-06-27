export const bgColorList: string[] = ['--color-primary'];

export type AvatarSize = 'small' | 'medium' | 'large';

export const INITIALS_MAX_LENGTH = 2;

export const BG_CLASS: string = 'bg-primary';

export const getInitials = (name: string): string => {
    if (!name.trim()) return '-';

    const sanitized = name.includes(',')
        ? name.replace(',', '').split(' ').reverse().join(' ')
        : name;

    const initials = sanitized
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    return initials.length > 0
        ? initials.substring(0, INITIALS_MAX_LENGTH)
        : '-';
};

export const getAvatarSizeClass = (size: AvatarSize): string => {
    return `avatar-${size}`;
};
