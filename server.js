const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// إنشاء قاعدة البيانات
const db = new sqlite3.Database('./faceapp.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// استرجاع المنشورات
app.get('/posts', (req, res) => {
  db.all("SELECT * FROM posts ORDER BY created_at DESC", [], (err, rows) => {
    if(err) return res.status(500).send(err);
    res.json(rows);
  });
});

// إضافة منشور
app.post('/posts', (req, res) => {
  const content = req.body.content;
  db.run("INSERT INTO posts(content) VALUES(?)", [content], function(err){
    if(err) return res.status(500).send(err);
    res.json({ id: this.lastID, content });
  });
});

app.listen(port, () => {
  console.log(`FaceApp running at http://localhost:${port}`);
});