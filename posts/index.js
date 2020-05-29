const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");

const app = express();

const posts = {};

app
  .use(parser.json())
  .use(
    cors({
      origin: "http://localhost:3001",
    })
  )
  .get("/posts", (_, res) => {
    res.send(posts);
  })
  .post("/posts", async (req, res) => {
    const id = randomBytes(4).toString("hex");
    const { title } = req.body;
    posts[id] = {
      id,
      title,
    };

    await axios.post("http://event-bus-srv:4005/events", {
      type: "PostCreated",
      data: posts[id],
    });

    res.status(201).send(posts[id]);
  })
  .post("/events", async (req, res) => {
    console.log(`Event: ${req.body.type}`);
    res.send({});
  });

app.listen(4000, () => {
  console.log("posts service on 4000");
});
