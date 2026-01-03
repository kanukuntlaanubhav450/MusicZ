const https = require('https');
const http = require('http');

// Handle OPTIONS preflight for CORS
exports.proxyAudioOptions = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
};

exports.proxyAudio = (req, res) => {
    const { url } = req.query;
    console.log("Proxy Request for:", url);

    if (!url) {
        return res.status(400).send('URL is required');
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, (stream) => {
        // Forward essential headers
        if (stream.headers['content-type']) {
            res.setHeader('Content-Type', stream.headers['content-type']);
        }
        if (stream.headers['content-length']) {
            res.setHeader('Content-Length', stream.headers['content-length']);
        }

        // CRITICAL CORS headers for Web Audio API
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        // Enable byte-range requests for audio seeking
        res.setHeader('Accept-Ranges', 'bytes');

        // Pipe the stream
        stream.pipe(res);
    }).on('error', (err) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Error fetching audio');
    });
};

