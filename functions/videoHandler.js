const Seedr = require('seedr');
const seedr = new Seedr();

const username = process.env.SEEDR_USERNAME;
const password = process.env.SEEDR_PASSWORD;

exports.handler = async (event) => {
  const videoId = event.queryStringParameters.id; // Get video ID from query parameters

  try {
    await seedr.login(username, password);
    const videoContents = await seedr.getVideos();

    let videoUrl = null;

    for (const videoArray of videoContents) {
      for (const vide of videoArray) {
        if (vide && vide.id && vide.id.toString() === videoId) {
          try {
            const downloadLink = await seedr.getFile(vide.id);
            videoUrl = downloadLink.url;
            break;
          } catch (error) {
            console.error(`Failed to fetch download link for video ID ${vide.id}:`, error);
          }
        }
      }
      if (videoUrl) break;
    }

    if (videoUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ videoUrl }),
        headers: { 'Content-Type': 'application/json' },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Video Not Found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
