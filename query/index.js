const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

const posts = {};

const handleEvent = (type, data) => {
  //
};

app
  .use(parser.json())
  .use(
    cors({
      origin: "http://localhost:3001",
    })
  )
  .get("/posts", (req, res) => {
    res.send(posts);
  })
  .post("/events", async (req, res) => {
    const { type, data } = req.body;

    if (type === "PostCreated") {
      const { id, title } = data;
      posts[id] = { id, title, comments: [] };
    }
    if (type === "CommentCreated") {
      const { id, content, postId } = data;
      const post = posts[postId];
      post.comments.push({ id, content });
    }
    if (type === "CommentUpdated") {
      const { id, postId, status, content } = data;
      const post = posts[postId];
      const comment = post.comments.find((x) => x.id === id);
      comment.status = status;
      comment.content = content;
    }
    handleEvent(type, data);

    return res.send({ status: "OK" });
  })
  .listen(4002, async () => {
    console.log(`query service on 4002`);
    const { data: event } = await axios.get("http://event-bus-srv:4005/events");
    for (const { data, type } of event) {
      console.log(`processing ${type}`);
      handleEvent(type, data);
    }
  });
