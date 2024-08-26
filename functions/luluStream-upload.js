exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
    try {
        const { url } = JSON.parse(event.body);
        
        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'URL is required' }),
            };
        }
        const apiKey = process.env.LULU_STREAM_API;
        const luluStreamApiUrl = `https://lulustream.com/api/upload/url?key=${apiKey}&url=${encodeURIComponent(url)}`;

        const response = await fetch(luluStreamApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Lulustream API request failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }


};