export default async (_req, res, path) => {
    try {
        const response = await fetch(`https://gimkit.com${path}`);

        ['content-type', 'set-cookie'].forEach((header) => {
            if (response.headers.has(header))
                res.setHeader(header, response.headers.get(header));
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    } catch (e) {
        console.error(e, path);
    }
};