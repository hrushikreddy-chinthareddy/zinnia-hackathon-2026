import { decode } from 'tiff';

import { browserLogError } from '../browser-logging';
import { parseErrorInformation } from '../server-logging';

import type { TiffIfd } from 'tiff';

export const base64ToUint8Array = (base64: string): Uint8Array | undefined => {
    try {
        if (typeof window === 'undefined') {
            return new Uint8Array(Buffer.from(base64, 'base64'));
        } else {
            const binaryString = window.atob(base64);
            return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
        }
    } catch (error) {
        browserLogError('Failed to decode base64 string:', {
            ...parseErrorInformation(error),
        });
        return undefined;
    }
};

export interface ViewerState {
    imageData: ImageData;
    width: number;
    height: number;
    scale: number;
    rotation: number;
}
const convertToRGBA = (page: TiffIfd): Uint8ClampedArray | undefined => {
    const pixelData = new Uint8ClampedArray(page.data);
    const pixelCount = page.width * page.height;

    switch (page.samplesPerPixel) {
        case 1: {
            // Converting grayscale to RGBA
            const rgba = new Uint8ClampedArray(pixelCount * 4);
            for (let i = 0; i < pixelCount; i++) {
                const val = pixelData[i];
                rgba.set([val, val, val, 255], i * 4);
            }
            return rgba;
        }
        case 3: {
            // Converting RGB to RGBA
            const rgba = new Uint8ClampedArray(pixelCount * 4);
            for (let i = 0; i < pixelCount; i++) {
                rgba.set(
                    [
                        pixelData[i * 3],
                        pixelData[i * 3 + 1],
                        pixelData[i * 3 + 2],
                        255,
                    ],
                    i * 4
                );
            }
            return rgba;
        }
        case 4: // Already RGBA
            return pixelData;
        default:
            browserLogError('Unsupported samplesPerPixel:', {
                ...parseErrorInformation(page.samplesPerPixel),
            });
            return undefined;
    }
};

export const renderTiffPagesToContainer = async (
    binaryData: string,
    container: HTMLElement,
    fallbackFileName = 'document.tiff'
): Promise<ViewerState[] | undefined> => {
    const binary = base64ToUint8Array(binaryData);
    if (binary === undefined) {
        browserLogError(
            'TIFF binary data is undefined after base64 conversion.'
        );
        return;
    }
    try {
        const buffer = binary;
        const pages: TiffIfd[] = decode(buffer);
        if (!pages?.length) {
            browserLogError('No pages found in the tiff');
            return;
        }
        container.innerHTML = '';
        const viewerStates: ViewerState[] = [];

        for (const page of pages) {
            if (!page || !page.width || !page.height || !page.data) return;
            const rgbaData = convertToRGBA(page);
            if (!rgbaData) continue;

            const imageData = new ImageData(rgbaData, page.width, page.height);
            const viewerState: ViewerState = {
                imageData,
                width: page.width,
                height: page.height,
                scale: 1,
                rotation: 0,
            };
            const canvas = document.createElement('canvas');
            drawCanvas(canvas, viewerState);
            container.appendChild(canvas);
            viewerStates.push(viewerState);
        }
        return viewerStates;
    } catch (err) {
        browserLogError('Error rendering tiff to canvas:', {
            ...parseErrorInformation(err),
        });
        // Fallback: download the tiff file
        try {
            const blob = new Blob([binary], { type: 'image/tiff' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fallbackFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (downloadErr) {
            browserLogError('Fallback download also failed:', {
                ...parseErrorInformation(downloadErr),
            });
        }
    }
};

export const drawCanvas = (canvas: HTMLCanvasElement, state: ViewerState) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !state.imageData) return;

    const { imageData, width, height, scale, rotation } = state;

    const angle = rotation % 360;
    const isVertical = angle === 90 || angle === 270;

    const scaledWidth = (isVertical ? height : width) * scale;
    const scaledHeight = (isVertical ? width : height) * scale;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d')?.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0);
};
