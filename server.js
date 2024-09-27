const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const fse = require('fs-extra');
const httpPort = 80;
let VERSION;

if (process.env.VER) {
    VERSION = process.env.VER.trim();
    console.log("Serving version: " + VERSION);
} else {
    console.error(
        "App version not set. Set the env var 'VER' to 01, 02, ... before you run the server"
    );
    process.exit();
}

const app = express();
app.use(express.json()); // za VER06

app.use((req, res, next) => {
    console.log(new Date().toLocaleString() + " " + req.url);
    next();
});

app.use(express.static(path.join(__dirname, "public", VERSION)));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "index.html"));
});


// potrebno na VER06
const webpush = require('web-push');

// Umjesto baze podataka, čuvam pretplate u datoteci: 
let subscriptions = [];
const SUBS_FILENAME = 'subscriptions.json';
try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
} catch (error) {
    console.error(error);    
}

app.post("/saveSubscription", function(req, res) {
    console.log(req.body);
    let sub = req.body.sub;
    subscriptions.push(sub);
    fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions));
    res.json({
        success: true
    });
});

async function sendPushNotifications(snapTitle) {
    webpush.setVapidDetails('mailto:bartul.tadic@fer.hr', 
    'BGtpNkfP_giVtVuptaBu0mDg_tG0mHzPlQ-zWK-vhry2jCQMvzfE2a3WyaDhTpPnAirv2xkwtvghSI8uXUMT9lM', 
    'UCpR1TeQVJN_8aOU-KDVfdCpKApd_hAoBqXZJx3C0hA');
    subscriptions.forEach(async sub => {
        try {
            console.log("Sending notif to", sub);
            await webpush.sendNotification(sub, JSON.stringify({
                title: 'New snap!',
                body: 'Somebody just snaped a new photo: ' + snapTitle,
                redirectUrl: '/index.html'
              }));    
        } catch (error) {
            console.error(error);
        }
    });
}
// /potrebno na VER06



app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});

