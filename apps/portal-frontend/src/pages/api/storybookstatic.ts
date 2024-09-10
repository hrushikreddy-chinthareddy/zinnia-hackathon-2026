import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { existsSync } from 'fs';
import fs from 'fs';
import { stat } from 'fs/promises';
import mime from 'mime';
import { NextApiRequest, NextApiResponse } from 'next';

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    const slug = (req.query?.slug as string[]).join('/');

    // for this I ran `npm run build-storybook` which will create the `storybook-static` directory and place all the files in it
    const resolvedPath = ['./storybook-static/', slug].join('');

    // if file is not located in specified folder then stop and end with 404
    if (!existsSync(resolvedPath)) {
        res.status(404);
        res.end();
    }

    // Read the entire file
    const file = fs.readFileSync(resolvedPath);

    // Set the cache header. Setting to private so it's cached on a individual level for 10 minutes. I just picked something random
    res.setHeader('Cache-Control', `private, max-age=600`);

    // Set size header so browser knows how large the file really is
    const stats = await stat(resolvedPath);
    res.setHeader('Content-Length', stats.size);

    // Set the mime type.
    const mimetype = mime.getType(resolvedPath);
    if (mimetype) {
        res.setHeader('Content-type', mimetype);
    }

    // winning
    res.send(file);
});
