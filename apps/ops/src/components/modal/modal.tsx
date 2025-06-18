import { Button } from '@zinnia/bloom/components';
import React from 'react';

interface Props {
    open: boolean;
    closeIcon: string;
    content: React.ReactNode;
    className?: string;
    modalTitle?: string;
    onCancel:() => void;
}

export const Modal: React.FC<Props> = props => {
    const { open, content, closeIcon = 'X', className = '', modalTitle = '', onCancel } = props;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60">
            <div className={`relative m-4 p-4 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white ${className}`}>
                <div className="absolute top-4 right-4">
                    <Button mode="link" onClick={onCancel}>{closeIcon}</Button>
                </div>
                {modalTitle &&
                    <div className="pb-4 text-xl font-medium text-slate-800 border-b border-slate-200">
                        {modalTitle}
                    </div>
                }
                <div className="py-4 text-slate-600 font-light leading-normal">
                    {content}
                </div>
            </div>
        </div>
    );
};
