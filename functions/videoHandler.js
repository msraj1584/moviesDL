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

 // Fetch the latest filecode from MongoDB using the videoId and sort by timestamp
 const videoId1 = Number(event.queryStringParameters.id); // If id is stored as a number
 const videoRecord = await collection.findOne(
  { id: videoId1 }, // Match the id
  { sort: { createdAt: -1 } } // Sort by createdAt in descending order to get the latest
);
let filecode = "";
// if (!videoRecord || !videoRecord.filecode) {
//   // return {
//   //   statusCode: 404,
//   //   body: JSON.stringify({ error: 'Movie Not Found in MongoDB' }),
//   //   headers: { 'Content-Type': 'application/json' },
//   // };
//   filecode = "123";
// }
// else{
//   filecode=videoRecord.filecode;
// }

const filecode1 = videoRecord.filecode;

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

    const apiKey = process.env.LULU_STREAM_API;
    const luluStreamApiUrl = `https://lulustream.com/api/file/info?key=${apiKey}&file_code=${filecode}`;

    const uploadResponse = await fetch(luluStreamApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!uploadResponse.ok) {
        throw new Error(`Lulustream API request failed with status ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const  player_img  = uploadData.result[0].player_img;



    if (videoUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ videoUrl,videoName,filecode,player_img }),
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