const { MongoClient } = require('mongodb');
const Seedr = require('seedr');
const seedr = new Seedr();
const mongoUri = process.env.MONGODB_URI; // MongoDB connection string

const username = process.env.SEEDR_USERNAME;
const password = process.env.SEEDR_PASSWORD;

exports.handler = async (event) => {
  const videoId = event.queryStringParameters.id; // Get video ID from query parameters

  try {
// MongoDB Atlas connection
client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
await client.connect();
const database = client.db('msrajmoviesdldb'); // Replace with your database name
const collection = database.collection('msrajmoviesdlcol'); // Replace with your collection name

// Fetch the filecode from MongoDB using the videoId
const videoRecord = await collection.findOne({ id: videoId });

if (!videoRecord || !videoRecord.filecode) {
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Movie Not Found in MongoDB' }),
    headers: { 'Content-Type': 'application/json' },
  };
}

const filecode = videoRecord.filecode;

    await seedr.login(username, password);
    const videoContents = await seedr.getVideos();

    let videoUrl = null;
    let videoName = null;
    for (const videoArray of videoContents) {
      for (const vide of videoArray) {
        if (vide && vide.id && vide.id.toString() === videoId) {
          try {
            const downloadLink = await seedr.getFile(vide.id);
            videoUrl = downloadLink.url;
            videoName = vide.name;
            break;
          } catch (error) {
            console.error(`Failed to fetch download link for movie ID ${vide.id}:`, error);
          }
        }
      }
      if (videoUrl) break;
    }

    if (videoUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ videoUrl,videoName,filecode }),
        headers: { 'Content-Type': 'application/json' },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Movie Not Found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};