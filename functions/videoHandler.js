const Seedr = require('seedr');
const seedr = new Seedr();

const username = process.env.SEEDR_USERNAME;
const password = process.env.SEEDR_PASSWORD;

exports.handler = async (event) => {
  //const videoId = event.path.split('/').pop(); // Extract videoId from URL
  const videoId = event.queryStringParameters.id; // Extract videoId from query parameters
  try {
    // Login to Seedr
    await seedr.login(username, password);

    // Fetch video details from Seedr
    const videoContents = await seedr.getVideos();
    
    let videoUrl = null;
    let videoName = null;

    for (const videoArray of videoContents) {
      for (const vide of videoArray) {
        if (vide && vide.id && vide.name && vide.id.toString() === videoId) {
          try {
            const downloadLink = await seedr.getFile(vide.id); // Fetch the download link
            videoUrl = downloadLink.url;
            videoName = vide.name;
            break; // Exit loop once the video is found
          } catch (error) {
            console.error(`Failed to fetch download link for video ID ${vide.id}:`, error);
          }
        }
      }
      if (videoUrl) break; // Exit outer loop if video is found
    }
    
    // Return the video URL or a 404 response if not found
    if (videoUrl) {
        return {
          statusCode: 200,
          body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${videoName}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f4f4f4;
                }
                .container {
                  max-width: 800px;
                  width: 100%;
                  padding: 20px;
                  background: #fff;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  border-radius: 8px;
                  text-align: center;
                }
                video {
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${videoName}</h1>
                <video controls>
                  <source src="${videoUrl}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            </body>
            </html>
          `,
          headers: {
            'Content-Type': 'text/html',
          },
        };
      } else {
      return {
        statusCode: 404,
        body: 'Video not found',
      };
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
};
