import sharp from 'sharp';

import { logError, parseErrorInformation } from '../server-logging';

export async function TiffConversion({
    binaryData,
}: {
    binaryData: string;
}): Promise<{ tiffBuffer: Buffer; success: boolean }> {
    const buffer = Buffer.from(binaryData, 'base64');

    let tiffBuffer: Buffer = buffer;
    let success = false;

    try {
        const metadata = await sharp(buffer).metadata();
        const pageCount = metadata?.pages || 1;

        const pageImages: Buffer[] = [];
        const pageHeights: number[] = [];
        const pageWidths: number[] = [];

        const paddingBetweenPages = 20;

        for (let i = 0; i < pageCount; i++) {
            const img = sharp(tiffBuffer, { page: i }).png();
            const meta = await img.metadata();
            pageHeights.push(meta?.height || 0);
            pageWidths.push(meta?.width || 0);
            const buffer = await img.toBuffer();
            pageImages.push(buffer);
        }

        const width = Math.max(...pageWidths);
        const totalHeight =
            pageHeights.reduce((sum, h) => sum + h, 0) +
            paddingBetweenPages * (pageCount - 1);

        const compositeInputs = [];
        let currentTop = 0;

        for (let i = 0; i < pageCount; i++) {
            compositeInputs.push({
                input: pageImages[i],
                top: currentTop,
                left: 0,
            });
            currentTop += pageHeights[i] + paddingBetweenPages;
        }

        tiffBuffer = await sharp({
            create: {
                width,
                height: totalHeight,
                channels: 4,
                background: 'white',
            },
        })
            .composite(compositeInputs)
            .png()
            .toBuffer();

        success = true;
    } catch (error: any) {
        logError('tiffConversion::Error converting TIFF to Png', {
            ...(parseErrorInformation(error) as any),
        });
    }

    return { tiffBuffer, success };
}
