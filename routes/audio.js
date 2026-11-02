import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

export default async (_req, res, path) => {
    try {
        const response = await fetch(`https://gimkit.com${path}`);

        ['content-type', 'set-cookie'].forEach((header) => {
            if (response.headers.has(header))
                res.setHeader(header, response.headers.get(header));
        });

        await streamPipeline(response.body, res);
    } catch (e) {
        console.error(e, path);
    }
};