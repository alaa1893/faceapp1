const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({ secret: 'faceappsecret', resave: false, saveUninitialized: true }));

// تسجيل مستخدم
app.post('/register', async (req,res)=>{
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password,10);
  db.run("INSERT INTO users(username,password) VALUES(?,?)",[username,hash], function(err){
    if(err) return res.status(500).send("المستخدم موجود");
    req.session.user_id = this.lastID;
    res.json({ success:true });
  });
});

// تسجيل الدخول
app.post('/login',(req,res)=>{
  const { username,password } = req.body;
  db.get("SELECT * FROM users WHERE username=?",[username], async (err,user)=>{
    if(err || !user) return res.status(400).send("خطأ");
    const match = await bcrypt.compare(password,user.password);
    if(match){ req.session.user_id = user.id; res.json({ success:true }); }
    else return res.status(400).send("خطأ");
  });
});

// تسجيل الخروج
app.get('/logout',(req,res)=>{
  req.session.destroy();
  res.json({ success:true });
});

// إضافة منشور
app.post('/posts', upload.single('image'), (req,res)=>{
  const user_id = req.session.user_id;
  if(!user_id) return res.status(401).send("غير مصرح");
  const content = req.body.content;
  const image = req.file ? req.file.filename : null;
  db.run("INSERT INTO posts(user_id,content,image) VALUES(?,?,?)",[user_id,content,image], function(err){
    if(err) return res.status(500).send(err);
    res.json({ id:this.lastID, content, image });
  });
});

// جلب المنشورات
app.get('/posts',(req,res)=>{
  db.all(`SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC`, [], (err,rows)=>{
    if(err) return res.status(500).send(err);
    res.json(rows);
  });
});

// إضافة تعليق
app.post('/comments',(req,res)=>{
  const user_id = req.session.user_id;
  if(!user_id) return res.status(401).send("غير مصرح");
  const { post_id, content } = req.body;
  db.run("INSERT INTO comments(post_id,user_id,content) VALUES(?,?,?)",[post_id,user_id,content], function(err){
    if(err) return res.status(500).send(err);
    res.json({ id:this.lastID, content });
  });
});

// جلب التعليقات
app.get('/comments/:post_id',(req,res)=>{
  db.all(`SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id=? ORDER BY created_at ASC`, [req.params.post_id], (err,rows)=>{
    if(err) return res.status(500).send(err);
    res.json(rows);
  });
});

// الإعجابات
app.post('/likes',(req,res)=>{
  const user_id = req.session.user_id;
  if(!user_id) return res.status(401).send("غير مصرح");
  const { post_id } = req.body;
  db.run("INSERT INTO likes(post_id,user_id) VALUES(?,?)",[post_id,user_id], function(err){
    if(err) return res.status(500).send(err);
    res.json({ success:true });
  });
});

// جلب عدد الإعجابات
app.get('/likes/:post_id',(req,res)=>{
  db.get("SELECT COUNT(*) as count FROM likes WHERE post_id=?",[req.params.post_id], (err,row)=>{
    if(err) return res.status(500).send(err);
    res.json(row);
  });
});

app.listen(port, ()=>console.log(`FaceApp متاح على http://localhost:${port}`));