const Seedr = require('../seedr');
const seedr = new Seedr();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { id } = JSON.parse(event.body);
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'ID is required' }),
            };
        }

        const username = process.env.SEEDR_USERNAME;
        const password = process.env.SEEDR_PASSWORD;

        await seedr.login(username, password);
        await seedr.rename(id,"testing_act1.mkv");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File renamed successfully.' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
