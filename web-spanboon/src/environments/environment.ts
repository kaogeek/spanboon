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
  googleClientId: "",
  facebookAppId: '', // default is 768184130301933
  facebookTestAppId: '', // default is 768184130301933
  consumerKeyTwitter: '',
  consumerSecretTwitter: '',
  accessTokenTwitter: '',
  accessTokenSecretTwitter: '',
  webBaseURL: 'https://localhost:4200',
  // apiBaseURL: "https://today-api.moveforwardparty.org/api",
  // apiBaseURL: "http://localhost:9000/api",
  apiBaseURL: "http://10.1.0.22:9000/api",
  // apiBaseURL: "http://10.254.1.193:9000/api",
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    vapidKey: ""
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
