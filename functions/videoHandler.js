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
              <title>M S RAJ Movies</title>
              <style>
              body {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #f0f0f0;
}

.video-container {
    width: 80%;
    max-width: 800px;
    background: #000;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    color: #fff;
}

h1, p {
    text-align: center;
}

video {
    width: 100%;
    border-radius: 10px;
}

button {
    display: block;
    width: 100%;
    padding: 10px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    margin-top: 10px;
}

button:hover {
    background: #555;
}
a {
    text-decoration: none;
}

              </style>
            </head>
            <body>
               <h1>M S RAJ Movies</h1>
              <div class="video-container">
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
          body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>M S RAJ Movies</title>
            </head>
            <body>
              <h1>Video Not Found</h1>
              <p>The video with the requested ID was not found.</p>
            </body>
            </html>
          `,
          headers: {
            'Content-Type': 'text/html',
          },
        };
      }
    } catch (error) {
    console.error('Error fetching video:', error);
    return {
      statusCode: 500,
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>M S RAJ Movies</title>
        </head>
        <body>
          <h1>Internal Server Error</h1>
          <p>There was an error fetching the video. Please try again later.</p>
        </body>
        </html>
      `,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  }
};