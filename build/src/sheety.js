"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const mongodb_1 = require("mongodb");
const credentials = require('./config/credentials.json');
async function readGoogleSheet() {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    const sheets = googleapis_1.google.sheets({
        version: 'v4',
        auth: client,
    });
    const spreadsheetId = '181rhuD9-SZWr1YbO3AX804p7biN56aJSLrso-ZB4ihI';
    const range = 'productionQuestion!A1:Z';
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values;
}
async function insertDataIntoDatabase(data, db) {
    const collection = db.collection('questions');
    for (const row of data) {
        const document = {
            column1: row[0],
            column2: row[1],
            column3: row[2],
        };
        await collection.insertOne(document);
    }
}
async function main() {
    try {
        const data = (await readGoogleSheet());
        // Connect to your MongoDB database
        const connectionUrl = 'mongodb://localhost:27017';
        const dbName = 'sheety';
        const client = await mongodb_1.MongoClient.connect(connectionUrl);
        const db = client.db(dbName);
        await insertDataIntoDatabase(data, db);
        console.log('Data inserted successfully!');
        client.close();
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
}
main();
//# sourceMappingURL=sheety.js.map