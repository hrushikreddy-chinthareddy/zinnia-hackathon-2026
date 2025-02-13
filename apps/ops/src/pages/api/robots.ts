import { isProd } from '@deps/utils/environment.helper';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    let robotsTxt = 'User-agent: *\nDisallow: /'; // Default: Block all crawlers

    if (isProd()) {
        robotsTxt = `User-agent: *\nAllow: /`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
}
