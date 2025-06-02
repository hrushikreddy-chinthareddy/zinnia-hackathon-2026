import { NextApiRequest, NextApiResponse } from "next";

import { browserLogInfo } from "@deps/utils/browser-logging";

const AUDIO_MIME_TYPE = "audio/mpeg";
const AUDIO_BYTES = "bytes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing or invalid audio URL" });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch audio" });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", AUDIO_MIME_TYPE);
        res.setHeader("Accept-Ranges", AUDIO_BYTES); // Enable partial content delivery
        res.setHeader("Content-Length", arrayBuffer.byteLength.toString());

        res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error: any) {
        browserLogInfo('api:play-call-log-audio::Error fetching audio content', { error });
        const statusCode = error?.status || 500;
        const message = error?.statusText || error?.message || 'Internal Server Error';

        res.status(statusCode).json({
            message,
        });
    }
}
