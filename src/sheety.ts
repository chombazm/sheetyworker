import {google} from 'googleapis';
import {MongoClient} from 'mongodb';
import {dataRowValidator, headerRowValidator} from './utils/validators';
import {expectedRows} from './config/setups';

const credentials = require('./config/credentials.json');

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
    if (dataRowValidator(row, expectedRows)) {
      // console.log('row is valid');
    }
    // validate row before inserting into database
    // await collection.insertOne(document);
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
