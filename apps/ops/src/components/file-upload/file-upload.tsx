import React, { useRef } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/icons_outlined/upload.svg';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/icons_outlined/x-cancel.svg';

import { AllowedExtensions, GetFileExtension } from './file-upload.helpers';

type FileUploadProps = {
    value: File[];
    onChange: (files: File[]) => void;
    error?: string | null;
    required?: boolean;
    singleFileUpload?: boolean;
};

const FileUpload: React.FC<FileUploadProps> = ({
    value = [],
    onChange,
    error: externalError,
    required = false,
    singleFileUpload = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        if (singleFileUpload && value.length > 0) {
            return;
        }
        const validFiles: File[] = [];
        let invalidFile: string | null = null;
        Array.from(files).forEach((file) => {
            const ext = GetFileExtension(file.name);
            if (
                AllowedExtensions.includes(ext) &&
                !value.some((f) => f.name === file.name)
            ) {
                validFiles.push(file);
            } else if (!AllowedExtensions.includes(ext)) {
                invalidFile = file.name;
            }
        });
        if (invalidFile) {
            setError(
                `File type not allowed: ${invalidFile}. Allowed types: ${AllowedExtensions.join(
                    ', '
                )}`
            );
        } else {
            setError(null);
        }
        if (validFiles.length > 0) {
            onChange([...value, ...validFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const updatedFiles = [...value];
        updatedFiles.splice(index, 1);
        onChange(updatedFiles);
    };

    return (
        <div>
            <div className="flex items-center gap-1">
                <Typography variant={TypographyVariant.FieldLabel}>
                    Attach the supporting document/(s)
                </Typography>
                {required && (
                    <span className="text-semantic-error">&nbsp;*</span>
                )}
            </div>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-4 mt-2"
            >
                {(error || externalError) && (
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="text-semantic-error"
                    >
                        {error || externalError}
                    </Typography>
                )}
                {value.map((file, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <UploadIcon
                                height={24}
                                width={24}
                                data-testid="upload-icon"
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                {file.name}
                            </Typography>
                        </div>
                        <CancelIcon
                            height={16}
                            width={16}
                            onClick={() => handleRemove(index)}
                            data-testid="cancel-icon"
                        />
                    </div>
                ))}

                <Typography variant={TypographyVariant.BodySm}>
                    Select a file or drag & drop it here
                </Typography>

                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="file-input"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={singleFileUpload && value?.length > 0}
                    className={`px-6 py-2 border-2 border-black rounded-full font-semibold transition
                        ${
                            singleFileUpload && value.length > 0
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-black hover:text-white'
                        }`}
                >
                    Select file
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
