import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import FileUpload from './file-upload';

describe('FileUpload', () => {
    const createFile = (name: string, type = 'text/plain') =>
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
        const files = [createFile('foo.txt'), createFile('bar.pdf')];
        render(<FileUpload value={files} onChange={jest.fn()} />);
        expect(screen.getByText('foo.txt')).toBeInTheDocument();
        expect(screen.getByText('bar.pdf')).toBeInTheDocument();
        expect(screen.getAllByTestId('upload-icon')).toHaveLength(2);
        expect(screen.getAllByTestId('cancel-icon')).toHaveLength(2);
    });

    it('calls onChange with new files from input', () => {
        const onChange = jest.fn();
        render(<FileUpload value={[]} onChange={onChange} />);
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        const file = createFile('test.txt');
        fireEvent.change(input, { target: { files: [file] } });
        expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('removes file when cancel icon is clicked', () => {
        const file = createFile('remove.txt');
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
        const file = createFile('drop.txt');
        fireEvent.drop(dropZone, {
            dataTransfer: { files: [file] },
        });
        expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('file input is cleared after file selection', () => {
        render(<FileUpload value={[]} onChange={jest.fn()} />);
        const input = screen.getByTestId('file-input') as HTMLInputElement;
        Object.defineProperty(input, 'files', {
            value: [createFile('clear.txt')],
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
});
