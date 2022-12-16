importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
    apiKey: "AIzaSyAGJnc3xf3dejKRG3ap59Dbf_LPO_MSwT8",
    authDomain: "devtestnotification-6fa25.firebaseapp.com",
    databaseURL: "https://devtestnotification-6fa25-default-rtdb.firebaseio.com/",
    projectId: "devtestnotification-6fa25",
    storageBucket: "devtestnotification-6fa25.appspot.com",
    messagingSenderId: "975487605237",
    appId: "1:975487605237:web:3d859c5a2758dde39b68bc",
    measurementId: "G-2XWS3SKTZG",
    vapidKey: "BJ2zY8lJ1Ao-LsOf0ISTpeFM3jwoa_1JyWPJJsswk9OVBpcPPiB1Be9k6wA7usIV3Zk7rnOc8CwfnIvKjhiM7uc"
});
const messaging = firebase.messaging();