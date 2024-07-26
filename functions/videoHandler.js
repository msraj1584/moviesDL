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
        // Read the HTML template
        const templatePath = path.join(__dirname, '../public/videoTemplate.html');
        let html = await fs.readFile(templatePath, 'utf8');
        
        // Replace placeholders with actual values
        html = html.replace('{{videoName}}', videoName).replace('{{videoUrl}}', videoUrl);
  
        return {
          statusCode: 200,
          body: html,
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