const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");

const app = express();

const commentsForPostId = {};

app
  .use(parser.json())
  .use(
    cors({
      origin: "http://localhost:3001",
    })
  )
  .get("/posts/:id/comments", (req, res) => {
    res.send(commentsForPostId[req.params.id]);
  })
  .post("/posts/:id/comments", async (req, res) => {
    const commentId = randomBytes(4).toString("hex");
    const { content } = req.body;
    const comments = commentsForPostId[req.params.id];
    if (!comments) {
      commentsForPostId[req.params.id] = [];
    }
    commentsForPostId[req.params.id].push({
      id: commentId,
      content,
      status: "pending",
    });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    });
    commentsForPostId[req.params.id] = comments;
    res.status(201).send(comments);
  })
  .post("/events", async (req, res) => {
    const { type, data } = req.body;
    if (type === "CommentModerated") {
      const { id, postId, status, content } = data;
      const comments = commentsForPostId[postId];
      const comment = comments.find((x) => x.id === id);
      comment.status = status;
      await axios.post("http://event-bus-srv:4005/events", {
        type: "CommentUpdated",
        data: { id, postId, status, content },
      });
    }
    res.send({});
  });

app.listen(4001, () => {
  console.log("comments service on 4001");
});
