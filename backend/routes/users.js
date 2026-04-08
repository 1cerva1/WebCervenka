const router = require("express").Router();
const db = require("../config/db");


router.get("/", (req, res) => {
    db.query("SELECT id, first_name, last_name FROM users ORDER BY last_name ASC",
        (err, data) => res.json(data)
    );
});


router.get("/:id", (req, res) => {
    db.query("SELECT * FROM users WHERE id = ?", [req.params.id],
        (err, user) => {
            if (!user.length) return res.json("Not found");

            db.query("SELECT * FROM posts WHERE user_id = ?", [req.params.id],
                (err, posts) => {
                    res.json({
                        user: user[0],
                        posts
                    });
                });
        });
});

module.exports = router;