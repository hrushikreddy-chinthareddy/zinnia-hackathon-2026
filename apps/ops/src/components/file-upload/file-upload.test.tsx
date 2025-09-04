import { render, fireEvent, screen } from '@testing-library/react';

import FileUpload from './file-upload';

describe('FileUpload', () => {
    const createFile = (name: string, type = 'application/pdf') =>
        new File(['dummy content'], name, { type });

    it('renders label and button', () => {
        render(<FileUpload value={[]} onChange={jest.fn()} />);
        expect(
            screen.getByText(/Attach the supporting document/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Select a file or drag & drop it here/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Select file/i })
        ).toBeInTheDocument();
    });

    it('shows uploaded files', () => {
        const files = [
            createFile('foo.pdf'),
            createFile('bar.jpg', 'image/jpeg'),
        ];
        render(<FileUpload value={files} onChange={jest.fn()} />);
        expect(screen.getByText('foo.pdf')).toBeInTheDocument();
        expect(screen.getByText('bar.jpg')).toBeInTheDocument();
        expect(screen.getAllByTestId('upload-icon')).toHaveLength(2);
        expect(screen.getAllByTestId('cancel-icon')).toHaveLength(2);
    });

    it('calls onChange with new files from input', () => {
        const onChange = jest.fn();
        render(<FileUpload value={[]} onChange={onChange} />);
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        const file = createFile('test.pdf');
        fireEvent.change(input, { target: { files: [file] } });
        expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('removes file when cancel icon is clicked', () => {
        const file = createFile('remove.pdf');
        const onChange = jest.fn();
        render(<FileUpload value={[file]} onChange={onChange} />);
        fireEvent.click(screen.getByTestId('cancel-icon'));
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('calls onChange with dropped files', () => {
        const onChange = jest.fn();
        render(<FileUpload value={[]} onChange={onChange} />);
        const dropZone = screen.getByText(
            /Select a file or drag & drop it here/i
        ).parentElement!;
        const file = createFile('drop.pdf');
        fireEvent.drop(dropZone, {
            dataTransfer: { files: [file] },
        });
        expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('file input is cleared after file selection', () => {
        render(<FileUpload value={[]} onChange={jest.fn()} />);
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        Object.defineProperty(input, 'files', {
            value: [createFile('clear.pdf')],
            writable: false,
        });
        fireEvent.change(input);
        expect(input.value).toBe('');
    });

    it('button triggers file input click', () => {
        render(<FileUpload value={[]} onChange={jest.fn()} />);
        const button = screen.getByRole('button', { name: /Select file/i });
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        const clickSpy = jest.spyOn(input, 'click');
        fireEvent.click(button);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('shows error if file type is not allowed', () => {
        render(<FileUpload value={[]} onChange={jest.fn()} />);
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        const file = new File(['dummy'], 'bad.exe', {
            type: 'application/x-msdownload',
        });
        fireEvent.change(input, { target: { files: [file] } });
        expect(screen.getByText(/File type not allowed/i)).toBeInTheDocument();
    });
});
