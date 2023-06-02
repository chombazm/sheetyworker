import {google} from 'googleapis';
import {MongoClient} from 'mongodb';
import {dataRowValidator, headerRowValidator} from './utils/validators';
import {expectedRows} from './config/setups';

const credentials = require('');

async function readGoogleSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({
    version: 'v4',
    auth: client as any,
  });

  const spreadsheetId = '181rhuD9-SZWr1YbO3AX804p7biN56aJSLrso-ZB4ihI';
  const range = 'productionQuestion!A1:Z'; // assumes first row is header row

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values;
}

async function insertDataIntoDatabase(data: string[][], db: any) {
  const collection = db.collection('questions');

  // the first row of the spreadsheet is the header row
  data.shift();

  for (const row of data) {
    // get row number
    const rowNumber = data.indexOf(row) + 1;
    if (!dataRowValidator(row, expectedRows)) {
      console.error(
        `Row ${rowNumber} is invalid or missing required data, skipping...`
      );
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
    const data = (await readGoogleSheet()) as string[][];

    // Connect to your MongoDB database
    const connectionUrl = 'mongodb://localhost:27017';
    const dbName = 'sheety';
    const client = await MongoClient.connect(connectionUrl);
    const db = client.db(dbName);

    headerRowValidator(data[0], expectedRows); //

    await insertDataIntoDatabase(data, db);

    console.log('Data inserted successfully!');
    client.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
