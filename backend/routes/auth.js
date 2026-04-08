const router = require("express").Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


router.post("/register", async (req, res) => {
    const { first_name, last_name, age, gender, username, password } = req.body;

    if (age < 13) return res.status(400).json("Min věk 13");

    const hash = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users SET ?", {
        first_name,
        last_name,
        age,
        gender,
        username,
        password: hash
    }, (err) => {
        if (err) return res.status(500).json(err);
        res.json("OK");
    });
});


router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, data) => {
        if (data.length === 0) return res.status(404).json("Not found");

        const valid = await bcrypt.compare(password, data[0].password);
        if (!valid) return res.status(400).json("Bad pass");

        const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET);

        res.json({ token });
    });
});

module.exports = router;