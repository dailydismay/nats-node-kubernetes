const express = require("express");
const parser = require("body-parser");
const axios = require("axios");

const app = express();

const events = [];

app
  .use(parser.json())
  .post("/events", async (req, res) => {
    const event = req.body;

    await axios.post("http://localhost:4000/events", event);
    await axios.post("http://localhost:4001/events", event);
    await axios.post("http://localhost:4002/events", event);
    await axios.post("http://localhost:4003/events", event);

    return res.send({ status: "OK" });
  })
  .get("/events", (req, res) => {
    res.send(events);
  })
  .listen(4005, () => {
    console.log(`event-bus service on 4005`);
  });
