/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
  production: false,
  googleClientId: "975487605237-p1l5vt5l444ur2f46p6p4ese1ba0pcgk.apps.googleusercontent.com",
  facebookAppId: 805338947265037, // default is 768184130301933
  facebookTestAppId: 805338947265037, // default is 768184130301933
  consumerKeyTwitter: 'm5fE9Qqj4CBNgT40JEK4NLwQv',
  consumerSecretTwitter: 'LHeix2fmzPz8gabiYBXBOgrSIakd4tG4SMpuyaRoboGmyebsn9',
  accessTokenTwitter: '1317733466222465024-ftP65EQdQoIkhlum8FF2SZzs7pOhQh',
  accessTokenSecretTwitter: '73pfaTAfS5jrH86d8ojdcK5JRjY0C0KUQuMmA59ZJT46m',
  webBaseURL: 'https://localhost:4200',
  // apiBaseURL: "https://today-api.moveforwardparty.org/api",
  // apiBaseURL: "http://localhost:9000/api",
  apiBaseURL: "http://10.1.0.22:9000/api",
  // apiBaseURL: "http://10.254.1.193:9000/api",
  firebase: {
    apiKey: "AIzaSyAGJnc3xf3dejKRG3ap59Dbf_LPO_MSwT8",
    authDomain: "devtestnotification-6fa25.firebaseapp.com",
    databaseURL: "https://devtestnotification-6fa25-default-rtdb.firebaseio.com/",
    projectId: "devtestnotification-6fa25",
    storageBucket: "devtestnotification-6fa25.appspot.com",
    messagingSenderId: "975487605237",
    appId: "1:975487605237:web:3d859c5a2758dde39b68bc",
    measurementId: "G-2XWS3SKTZG",
    vapidKey: "BJ2zY8lJ1Ao-LsOf0ISTpeFM3jwoa_1JyWPJJsswk9OVBpcPPiB1Be9k6wA7usIV3Zk7rnOc8CwfnIvKjhiM7uc"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
