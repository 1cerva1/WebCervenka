const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "mysqlstudenti.litv.sssvt.cz",
    user: "cervenkamatej",
    password: "123456",
    database: "4a2_cervenkamatej_db1"
});

db.connect(err => {
    if (err) throw err;
    console.log("DB připojena");
});

module.exports = db;