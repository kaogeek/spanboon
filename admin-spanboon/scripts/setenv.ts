const { writeFile } = require('fs');
const { argv } = require('yargs');

// read the command line arguments passed with yargs
const environment = argv.environment;
const isProduction = environment === 'production';

const targetPath = isProduction ? './src/environments/environment.prod.ts' : './src/environments/environment.ts';
const firebasePath = './src/firebase-messaging-sw.js';
const envPath = isProduction ? './.env.production' : './.env';

// read environment variables from .env file
require('dotenv').config({ path: envPath });

// we have access to our environment variables
// in the process.env object thanks to dotenv
const environmentFileContent = `/*
* @license Spanboon Platform v0.1
* (c) 2020-2021 KaoGeek. http://kaogeek.dev
* License: MIT. https://opensource.org/licenses/MIT
* Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
*/

export const environment = {
   production: ${isProduction},
   apiBaseURL: "${process.env["API_BASE_URL"]}",
   firebase: {
    apiKey: "${process.env["FIREBASE_API_KEY"]}",
    authDomain: "${process.env["FIREBASE_AUTH_DOMAIN"]}",
    databaseURL: "${process.env["FIREBASE_DATABASE_URL"]}",
    projectId: "${process.env["FIREBASE_PROJECT_ID"]}",
    storageBucket: "${process.env["FIREBASE_STORAGE_BUCKET"]}",
    messagingSenderId: "${process.env["FIREBASE_MESSAGE_SENDER_ID"]}",
    appId: "${process.env["FIREBASE_APP_ID"]}",
    measurementId: "${process.env["FIREBASE_MEASUREMENT_ID"]}",
    vapidKey: "${process.env["FIREBASE_VAPID_KEY"]}"
   },
};
`;

// write the content to the respective file
writeFile(targetPath, environmentFileContent, function (err) {
    if (err) {
        console.log(err);
    }

    console.log(`Wrote variables to ${targetPath}`);
});
