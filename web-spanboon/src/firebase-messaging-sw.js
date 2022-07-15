importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
    apiKey: "AIzaSyAGOxY8OYqNDDftfVfutaRKPYudA24Auog",
    authDomain: "todaynoti.firebaseapp.com",
    projectId: "todaynoti",
    storageBucket: "todaynoti.appspot.com",
    messagingSenderId: "486941958412",
    appId: "1:486941958412:web:9758aa618e15574d132929",
    measurementId: "G-KWY2TG8MWH",
    vapidKey: "BJYIfqI5KKxJTghbRj1x5LeZaT63PHxfjBRvK15uPyFDGMek8dEX9u9Vl0l_vUpOoyy2uH9tgNzE3jLplZiNUfc"
});
const messaging = firebase.messaging();