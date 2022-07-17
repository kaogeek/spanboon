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
  googleClientId: "1062438301611-qa2oqcfbusrcvji31ljj88fork4ln8t4.apps.googleusercontent.com",
  facebookAppId: 1439136826405744, // default is 768184130301933
  facebookTestAppId: 554520535534087, // default is 768184130301933
  consumerKeyTwitter: '81eBPMrAFW20CN0PRnughGs4T',
  consumerSecretTwitter: '9iYBWJTUA9W048wzjBZ4n0R6wjWojogGhNlC2C9GcismIF6CNS',
  accessTokenTwitter: '1317733466222465024-8zwiXq7cLTJ544BfLBmx7hMjQvPs2M',
  accessTokenSecretTwitter: '7n685xtTXHc8gSF4Yl7ChoFcw2u07mJk9Tnm49kC5o5s0',
  webBaseURL: 'https://localhost:4200',
  // apiBaseURL: "https://today-api.moveforwardparty.org/api",
  apiBaseURL: "http://localhost:9100/api",
  // apiBaseURL: "http://10.1.1.161:9000/api",
  firebase: {
    apiKey: "AIzaSyBqqB9LekJghk72k1qgmW6jHro_wFUa19o",
    authDomain: "pushnotification-ac673.firebaseapp.com",
    databaseURL: "https://pushnotification-ac673-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pushnotification-ac673",
    storageBucket: "pushnotification-ac673.appspot.com",
    messagingSenderId: "80949496490",
    appId: "1:80949496490:web:e21282b08d75a260051ed3",
    measurementId: "G-HEEXD2LN9N",
    vapidKey: "BJstt8A9ctpUP9yDFlqISNGQnI7bhWvmeJ-Q9ogdI3wPQEOQvuFi5jhOz0crLA-UsN0QPKKxH_A20QIiDV9qTAs"
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
