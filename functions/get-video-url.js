const Seedr = require('seedr');
const seedr = new Seedr();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const videoId = event.queryStringParameters.id;
        if (!videoId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Video ID is required' }),
            };
        }

        const username = process.env.SEEDR_USERNAME;
        const password = process.env.SEEDR_PASSWORD;

        await seedr.login(username, password);
        const videoContents = await seedr.getVideos();
        let foundVideo = null;

        for (const videoArray of videoContents) {
            for (const video of videoArray) {
                if (video && video.id === videoId) {
                    const downloadLink = await seedr.getFile(video.id);
                    foundVideo = { url: downloadLink.url };
                    break;
                }
            }
            if (foundVideo) break;
        }

        if (foundVideo) {
            return {
                statusCode: 200,
                body: JSON.stringify(foundVideo),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Video not found' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
