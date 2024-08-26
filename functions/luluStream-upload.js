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

        const uploadData = await uploadResponse.json();
        const { filecode } = uploadData.result;
        if (!filecode) {
            throw new Error('File code not found in upload response');
        }
        // Second request: Get file info
        const fileInfoUrl = `https://lulustream.com/api/file/info?key=${apiKey}&file_code=${filecode}`;
        const fileInfoResponse = await fetch(fileInfoUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!fileInfoResponse.ok) {
            throw new Error(`Lulustream API file info request failed with status ${fileInfoResponse.status}`);
        }

        const fileInfoData = await fileInfoResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify(fileInfoData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }


};