const Seedr = require('../seedr');
const { MongoClient } = require('mongodb');
const seedr = new Seedr();

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { fid,id } = JSON.parse(event.body);
        if (!fid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'ID is required' }),
            };
        }
        // Seedr credentials
        const username = process.env.SEEDR_USERNAME;
        const password = process.env.SEEDR_PASSWORD;


        await seedr.login(username, password);
        await seedr.deleteFolder(fid);

        // MongoDB Atlas connection
        const uri = process.env.MONGODB_URI; // Your MongoDB connection string
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client.connect();

        const database = client.db('msrajmoviesdldb'); // Replace with your database name
        const collection = database.collection('msrajmoviesdlcol'); // Replace with your collection name
        const result = await collection.deleteOne({ id: id });
        

        // Close MongoDB connection
        await client.close();
       
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File deleted successfully.' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
