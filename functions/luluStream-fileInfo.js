const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "type": "service_account",
            "project_id": "msrajmovies-db",
            "private_key_id": "340dae32fad6270a09f9b87fa77a300f4f6b3b91",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1eiLUTBkddqH/\no20yw2DZtCybzYTf0LMynxQtPsP0TOTvbCEOwQswIBROB7HkkeTqGs3dr8lA+utW\nOxptMJQO0VyI8d4U7rEcbyBKlvw8HvvZF97+DjA161eWga9j92F2wm+fQjfvYcuB\n/GIc1HQQC4eE0z6oEQS99dFbijfGQ7+r1yIq9zRihqY4YFK7R8iHiIyjjS8itb1D\nbh46P4EyZXjIqzdLmM23kI7aWYDgiX/5u+yU4n8UF85o7VBkHfX0uleqfWZLQcw+\nynCjXOD/hUGbyQN2Aj+LjPxMDTLD+qnR6W+TzTpyOZTpNQpkvPURXHn6y0ddcMtp\njL0yI3iVAgMBAAECggEAJJsX1nHpKP/KipnJB5HQgeltjBnnIQxkcSQUelHsTeWK\n0l6hxmubGaCG5/x2XjAtmClC+GIietiCSvkOChNf8iM6AqejD97b2+vwfAs7otbv\nHynJAb8T63RmzQWovsXiI4Xx5RKC3OcBmV0y3zTdmnTw55KC03znU3f3vHrDaFrf\nZ+23mtq561wqIoaE9ITRAI5vKOBEwrx2KW+Xlfl5k/fCUgod8BkPiK1GS7LwElDg\nChIiqjlbQiWNvgG5gTyWEhr3hsy1Ck4E+nKPTbEYK3mJHgOzL534lzwqB8Aa5Fha\nJbg7BedQUiLObCnTXzMRvuAY2esPEid9CrVNcN1LkQKBgQD1gD2Kh0G237IIypjD\nKeT7tJtDKUQOfdnKtcZ17IeHmdyPAG6JH9hiN2YoVJkbAA38lG9aSv5AjybqwSTL\nJgblM1/h+mAxxsCZ33Hd6KwgKUGjS1KQQzCq6ym+7GL2pYczg+wFCwghj4Q7YYxe\ndh63A0PrZ8+VmRoJPPEI4wFaDQKBgQC9PPVnGVFgOqARNeDmldWvPHWiVtRBTbOB\nRKSHjja122WTWVLEVw1z4ZioU41WBX2bhqSQHN3kickzwkkOwaqETfRh66N6T11z\n22FUw9ewoHkTGwwGIHeMECPaFGEvoRgxhvwEY6PaLn3+J7pXf69aTOuMKbITykXy\nEhIwL5eeqQKBgGxzPTxv6bi2cvhtPzSf0jbbHud5WEYqlEZ3LHe1iF1/u640W6AZ\nwEYLAQb58DS8PnGAxPwXOuAcHO4BapaPcuZXXpj+OPZkPXr7+Vo1SaxfbU6MnKl7\n9QjcH7HmzQT2NJauRVoo+GuS8bAltJOaDJF+UMeyMUJ9wsGn+TaayWMVAoGBAIUu\n3dfNrcP3/qeeL8aZNWa7Ol8ilQfQ08DqupDcugyLeJWXi/S6/7DK2VG+W/5qpthK\njo8OgexSPNS8rAZCruumoZQ47zkpmi/r+jhaDPc2OYAEzRWSzBA7W8AkD7IhwpE4\n2y2LosnvZqT0+OST7Km08SIYRkg/V7LinQJkvGThAoGAH70hu9L6DA5hwNzmPVNh\nobDWTBFMCXhvGcKIBLBcRTZYPDPW5TRn1bZXhRjI6k8mQl1kEGBpdqkzTb0WgNh6\nKfV/Ggfn5ZKIg49YwyeH/FXGFFjbBDKkepxAmQeOD4UhTZGa5SpT7/lPRi/LgkAH\nEemqjaggrkhdkWyaxR/lQ/g=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-1k80i@msrajmovies-db.iam.gserviceaccount.com",
            "client_id": "114996186053613020060",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1k80i%40msrajmovies-db.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
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
