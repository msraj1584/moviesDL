const fs = require('fs').promises;
const path = require('path');
const Seedr = require('seedr');
const seedr = new Seedr();

const username = process.env.SEEDR_USERNAME;
const password = process.env.SEEDR_PASSWORD;

const getTemplate = async (templateName, replacements = {}) => {
  try {
    let template = await fs.readFile(path.join(__dirname, templateName), 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value);
    }
    return template;
  } catch (error) {
    console.error('Error reading template file:', error);
    throw error;
  }
};

exports.handler = async (event) => {
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
      const html = await getTemplate('movie.html', { videoName, videoUrl });
      return {
        statusCode: 200,
        body: html,
        headers: {
          'Content-Type': 'text/html',
        },
      };
    } else {
      const html = await getTemplate('404.html');
      return {
        statusCode: 404,
        body: html,
        headers: {
          'Content-Type': 'text/html',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    const html = await getTemplate('500.html');
    return {
      statusCode: 500,
      body: html,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  }
};
