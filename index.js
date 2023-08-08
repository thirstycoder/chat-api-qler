require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const KJUR = require("jsrsasign");

const app = express();
const https = require("https").Server(app);
const port = process.env.PORT || 4000;

app.use(bodyParser.json(), cors());
app.options("*", cors());

app.post("/", (req, res) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    const oHeader = { alg: "HS256", typ: "JWT" };

    const oPayload = {
        sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
        mn: req.body.meetingNumber,
        role: req.body.role,
        iat: iat,
        exp: exp,
        appKey: process.env.ZOOM_MEETING_SDK_KEY,
        tokenExp: iat + 60 * 60 * 2,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, process.env.ZOOM_MEETING_SDK_SECRET);

    res.json({
        signature: signature,
    });
});

const ingredients = [
    {
        id: "1",
        item: "Bacon",
    },
    {
        id: "2",
        item: "Eggs",
    },
    {
        id: "3",
        item: "Milk",
    },
    {
        id: "4",
        item: "Butter",
    },
];

app.get("/test", (req, res) => {
    res.send(ingredients);
});
const server = app.listen(port, () => console.log(`Zoom Meeting SDK Auth Endpoint Sample Node.js listening on port ${port}!`));

const socketIO = require("socket.io")(https, {
    cors: {
        origin: "*",
    },
});

socketIO.listen(server);

socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("message", function (data) {
        console.log("Message received " + data.name + ":" + data.message);

        socketIO.emit("message", data);
    });
});
