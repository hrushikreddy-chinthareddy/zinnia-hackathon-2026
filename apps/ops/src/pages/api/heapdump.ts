import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import v8 from 'v8';

export default async function heapDump(req: NextApiRequest, res: NextApiResponse) {
    const accessToken = (await getAccessToken(req, res)).accessToken;
    if (!accessToken) {
        return res.status(401).end();
    }

    try {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename="heapdump.heapsnapshot"');

        const heapSnapshotStream = v8.getHeapSnapshot();

        heapSnapshotStream.pipe(res);

        heapSnapshotStream.on('end', () => {
            res.end();
        });

        heapSnapshotStream.on('error', error => {
            console.error('Heap snapshot stream error:', error);
            res.status(500).end('An error occurred while generating the heap snapshot.');
        });
    } catch (error) {
        console.error(error);
        res.status(500).end('An error occurred.');
    }
}
