import { renderHook, act } from '@testing-library/react';

import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';

import { useAttachments } from './useAttachments';

describe('useAttachments', () => {
    // Mock data
    const mockDocument1: TaskDocument = {
        documentId: 'doc1',
        documentName: 'test1.pdf',
        documentExt: 'pdf',
    };

    const mockDocument2: TaskDocument = {
        documentId: 'doc2',
        documentName: 'test2.pdf',
        documentExt: 'pdf',
    };

    const mockFormContext = {
        mappedDocuments: [] as TaskDocument[],
        setMappedDocuments: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormContext.mappedDocuments = [];
    });

    test('should initialize with empty array when initialFiles is an empty array', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: [],
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        expect(result.current.attachments).toEqual([]);
    });

    test('should initialize with empty array when initialFiles is null', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: null,
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        expect(result.current.attachments).toEqual([]);
    });

    test('should initialize with empty array when initialFiles is undefined', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: undefined,
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        expect(result.current.attachments).toEqual([]);
    });

    test('should initialize with single document when initialFiles is a single document and multiple is false', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: mockDocument1,
                multiple: false,
                onChange,
                formContext: mockFormContext,
            })
        );

        expect(result.current.attachments).toEqual([mockDocument1]);
    });

    test('should initialize with array of documents when initialFiles is an array and multiple is true', () => {
        const onChange = jest.fn();
        const initialDocs = [mockDocument1, mockDocument2];

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: initialDocs,
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        expect(result.current.attachments).toEqual(initialDocs);
    });

    test('should add document when handleSetAttachments is called without remove operation', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: [],
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        act(() => {
            result.current.handleSetAttachments(mockDocument1);
        });

        expect(result.current.attachments).toEqual([mockDocument1]);
        expect(onChange).toHaveBeenCalledWith([mockDocument1]);

        // Get the callback function that was passed to setMappedDocuments
        const setMappedDocumentsCallback =
            mockFormContext.setMappedDocuments.mock.calls[0][0];

        // Test that the callback function returns the expected result
        const callbackResult = setMappedDocumentsCallback([]);
        expect(callbackResult).toEqual([mockDocument1]);
    });

    test('should replace document when multiple is false and handleSetAttachments is called', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: mockDocument1,
                multiple: false,
                onChange,
                formContext: mockFormContext,
            })
        );

        act(() => {
            result.current.handleSetAttachments(mockDocument2);
        });

        expect(result.current.attachments).toEqual([mockDocument2]);
        expect(onChange).toHaveBeenCalledWith(mockDocument2); // Note: single document, not array

        // Get the callback function that was passed to setMappedDocuments
        const setMappedDocumentsCallback =
            mockFormContext.setMappedDocuments.mock.calls[0][0];

        // Test that the callback function returns the expected result
        const callbackResult = setMappedDocumentsCallback([mockDocument1]);
        expect(callbackResult).toEqual([mockDocument1, mockDocument2]);
    });

    test('should remove document when handleSetAttachments is called with remove operation', () => {
        const onChange = jest.fn();
        const initialDocs = [mockDocument1, mockDocument2];
        mockFormContext.mappedDocuments = [...initialDocs];

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: initialDocs,
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        act(() => {
            result.current.handleSetAttachments(
                mockDocument1,
                ActionTypes.Remove
            );
        });

        expect(result.current.attachments).toEqual([mockDocument2]);
        expect(onChange).toHaveBeenCalledWith([mockDocument2]);

        // Get the callback function that was passed to setMappedDocuments
        const setMappedDocumentsCallback =
            mockFormContext.setMappedDocuments.mock.calls[0][0];

        // Test that the callback function returns the expected result
        const callbackResult = setMappedDocumentsCallback([
            mockDocument1,
            mockDocument2,
        ]);
        expect(callbackResult).toEqual([
            { ...mockDocument1, OperationType: ActionTypes.Remove },
            mockDocument2,
        ]);
    });

    test('should handle formContext being undefined', () => {
        const onChange = jest.fn();

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: mockDocument1,
                multiple: true,
                onChange,
                formContext: undefined,
            })
        );

        act(() => {
            result.current.handleSetAttachments(mockDocument2);
        });

        // Should not throw error when formContext is undefined
        expect(result.current.attachments).toEqual([
            mockDocument1,
            mockDocument2,
        ]);
        expect(onChange).toHaveBeenCalledWith([mockDocument1, mockDocument2]);
    });

    test('should correctly update mapped documents when formContext exists', () => {
        const onChange = jest.fn();
        mockFormContext.mappedDocuments = [mockDocument1];

        const { result } = renderHook(() =>
            useAttachments({
                initialFiles: [mockDocument1],
                multiple: true,
                onChange,
                formContext: mockFormContext,
            })
        );

        act(() => {
            result.current.handleSetAttachments(mockDocument2);
        });

        // Get the callback function that was passed to setMappedDocuments
        const setMappedDocumentsCallback =
            mockFormContext.setMappedDocuments.mock.calls[0][0];

        // Test that the callback function returns the expected result
        const callbackResult = setMappedDocumentsCallback([mockDocument1]);
        expect(callbackResult).toEqual([mockDocument1, mockDocument2]);
    });
});
