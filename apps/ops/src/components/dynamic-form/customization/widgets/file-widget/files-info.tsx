import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';

export type FileInfoType = {
    name: string;
    size: number;
    type: string;
    dataURL?: string | null;
};

export function FilesInfo({
    filesInfo,
}: {
    filesInfo: FileInfoType[];
    onRemove?: (index: number) => void;
}) {
    if (!filesInfo.length) return null;

    return (
        <ul className="file-info mt-2">
            {filesInfo.map((fileInfo, i) => (
                <li
                    key={i}
                    className="p-2 border-1 border-gray-100 my-4 max-w-sm"
                >
                    <div className="typography-content-body-sm-bold flex gap-2">
                        <UploadIcon height={25} width={25} />
                        <span>{fileInfo.name}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
