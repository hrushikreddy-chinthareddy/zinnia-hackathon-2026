import React, { useRef } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/icons_outlined/upload.svg';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/icons_outlined/x-cancel.svg';

type FileUploadProps = {
    value: File[];
    onChange: (files: File[]) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ value = [], onChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter(
            (file) => !value.some((f) => f.name === file.name)
        );
        onChange([...value, ...newFiles]);
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
            <Typography variant={TypographyVariant.FieldLabel}>
                Attach the supporting document(s)
            </Typography>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-4 mt-2"
            >
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
                    className="px-6 py-2 border-2 border-black rounded-full font-semibold hover:bg-black hover:text-white transition"
                >
                    Select file
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
