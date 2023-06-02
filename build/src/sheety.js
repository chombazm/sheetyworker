"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const mongodb_1 = require("mongodb");
const validators_1 = require("./utils/validators");
const setups_1 = require("../config/setups");
const credentials = require('../config/credentials.json');
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
    const range = 'productionQuestion!A1:Z'; // assumes first row is header row
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values;
}
async function insertDataIntoDatabase(data, db) {
    const collection = db.collection('questions');
    // the first row of the spreadsheet is the header row
    data.shift();
    for (const row of data) {
        // get row number
        const rowNumber = data.indexOf(row) + 1;
        if (!(0, validators_1.dataRowValidator)(row, setups_1.expectedRows)) {
            console.error(`Row ${rowNumber} is invalid or missing required data, skipping...`);
            continue;
        }
        const document = {
            level: row[0],
            subject: row[1],
            topic: row[2],
            question: row[3],
            correctAnswer: row[4],
            incorrectAnswer1: row[5],
            incorrectAnswer3: row[7],
            howToSolve: row[8],
            type: row[9],
            learningObjective: row[10],
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
        (0, validators_1.headerRowValidator)(data[0], setups_1.expectedRows); //
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