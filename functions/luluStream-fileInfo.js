const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "type": process.env.FIREBASE_TYPE,
            "project_id": process.env.FIREBASE_PROJECT_ID,
            "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
            "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            "client_email": process.env.FIREBASE_CLIENT_EMAIL,
            "client_id": process.env.FIREBASE_CLIENT_ID,
            "auth_uri": process.env.FIREBASE_AUTH_URI,
            "token_uri": process.env.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
            "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL // This is optional if using Firestore only
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
