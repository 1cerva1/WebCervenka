const router = require("express").Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

router.post("/", auth, (req, res) => {
    const { title, content, image } = req.body;

    const postData = {
        user_id: req.user.id,
        title,
        content,
        image: image || null
    };

    db.query("INSERT INTO posts SET ?", postData, err => {
        if (err && err.code === "ER_BAD_FIELD_ERROR") {
            const fallbackData = {
                user_id: req.user.id,
                title,
                content
            };

            return db.query("INSERT INTO posts SET ?", fallbackData, fallbackErr => {
                if (fallbackErr) return res.status(500).json(fallbackErr);
                res.json("Post created");
            });
        }

        if (err) return res.status(500).json(err);
        res.json("Post created");
    });
});

router.get("/", (req, res) => {
    db.query(`
        SELECT posts.*, users.username,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes
        FROM posts
        JOIN users ON users.id = posts.user_id
        ORDER BY posts.created_at DESC
    `, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

router.post("/:id/comments", auth, (req, res) => {
    db.query("INSERT INTO comments SET ?", {
        user_id: req.user.id,
        post_id: req.params.id,
        content: req.body.content
    }, err => {
        if (err) return res.status(500).json(err);
        res.json("comment added");
    });
});

router.get("/:id/comments", (req, res) => {
    db.query(`
        SELECT comments.*, users.username
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE post_id = ?
        ORDER BY created_at DESC
    `, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

router.post("/:id/like", auth, (req, res) => {
    db.query("INSERT INTO likes SET ?", {
        user_id: req.user.id,
        post_id: req.params.id
    }, err => {
        if (err) return res.status(400).json("Already liked");
        res.json("liked");
    });
});

router.get("/:id/likes", (req, res) => {
    db.query(`
        SELECT users.username, likes.created_at
        FROM likes
        JOIN users ON users.id = likes.user_id
        WHERE post_id = ?
    `, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

module.exports = router;
