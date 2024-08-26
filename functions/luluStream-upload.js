const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// Load the service account key JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK with the service account
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optionally specify databaseURL if using Realtime Database
        // databaseURL: 'https://your-project-id.firebaseio.com'
    });
}

const db = admin.firestore(); // Firestore instance

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
    try {
        const { url, id } = JSON.parse(event.body);

        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'URL is required' }),
            };
        }

        const apiKey = process.env.LULU_STREAM_API;
        const luluStreamApiUrl = `https://lulustream.com/api/upload/url?key=${apiKey}&url=${encodeURIComponent(url)}`;

        const uploadResponse = await fetch(luluStreamApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Lulustream API request failed with status ${uploadResponse.status}`);
        }

        const uploadData = await uploadResponse.json();
        const { filecode } = uploadData.result;
        if (!filecode) {
            throw new Error('File code not found in upload response');
        }

        // Store data in Firestore
        const data = {
            id,
            filecode,
            timestamp: admin.firestore.FieldValue.serverTimestamp() // Timestamp for ordering
        };

        await db.collection('uploads').add(data); // Add document to the 'uploads' collection

        return {
            statusCode: 200,
            body: JSON.stringify(uploadData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};
