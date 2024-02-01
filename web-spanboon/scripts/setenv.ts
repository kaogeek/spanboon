const { writeFile } = require('fs');
const { argv } = require('yargs');

// read the command line arguments passed with yargs
const environment = argv.environment;
const isStaging = environment === 'staging';
const isProduction = environment === 'production';

const targetPath = isProduction ? './src/environments/environment.prod.ts' : isStaging ? './src/environments/environment.stg.ts' : './src/environments/environment.ts';
const firebasePath = './src/firebase-messaging-sw.js';
const envPath = isProduction ? './.env.production' : isStaging ? '.env.staging' : './.env';

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
   googleClientId: "${process.env["GOOGLE_CLIENT_ID"]}",
   facebookAppId: "${process.env["FACEBOOK_APP_ID"]}",
   facebookTestAppId: "${process.env["FACEBOOK_TEST_APP_ID"]}",
   consumerKeyTwitter: "${process.env["TWITTER_CONSUMER_KEY"]}",
   consumerSecretTwitter: "${process.env["TWITTER_CONSUMER_SECRET_KEY"]}",
   accessTokenTwitter: "${process.env["TWITTER_ACCESS_TOKEN"]}",
   accessTokenSecretTwitter: "${process.env["TWITTER_ACCESS_TOKEN_SECRET_KEY"]}",
   apiBaseURL: "${process.env["API_BASE_URL"]}",
   webBaseURL: "${process.env["WEB_BASE_URL"]}",
   sha256_cert_fingerprints: "${process.env["SHA_256_CERT_FINGER_PRINTS"]}",
   announcement: {
    config: "${process.env["CONFIG_ADMIN_ANNOUNCEMENT"]}",
    default: "${process.env["DEFAULT_ANNOUNCEMENT"]}",
    annouce: "${process.env["ANNOUNCEMENT"]}",
   },
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
   memberShip: {
    grantType: "${process.env["GRANT_TYPE"]}",
    clientId: "${process.env["CLIENT_ID"]}",
    clientSecret: "${process.env["CLIENT_SECRET"]}",
    scope: "${process.env["SCOPE"]}",
    webBaseURL: "${process.env["WEB_BASE_URL"]}",
    bindingBaseURL: "${process.env["APP_MFP_API"]}",
 }
};
`;

const firebaseFileContent = `

importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCwPc356BjVhcuahlIcdGoJr7LP-zqAZjc",
    authDomain: "mfp-today.firebaseapp.com",
    databaseURL: "https://mfp-today-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mfp-today",
    storageBucket: "mfp-today.appspot.com",
    messagingSenderId: "1062438301611",
    appId: "1:1062438301611:web:13d294be340da947642cee",
    measurementId: "G-MZTEBYJD62",
    vapidKey: "BFL7fI6__aC8vJrNNJSiO8bUaQb_xqzI_4rZJdDJ6kNCLXEspw1tBuGdI6d-D7DJkbhbShQquE2Y_MfUYJEtgvc"
});
const messaging = firebase.messaging();
`;

// write the content to the respective file
writeFile(targetPath, environmentFileContent, function (err) {
    if (err) {
        console.log(err);
    }

    console.log(`Wrote variables to ${targetPath}`);
});

// write the content to the respective file
writeFile(firebasePath, firebaseFileContent, function (err) {
    if (err) {
        console.log(err);
    }

    console.log(`Wrote Firebase to ${firebasePath}`);
});
