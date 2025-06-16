require('dotenv').config();

const express = require("express");
const path = require("path");
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const Blog= require('./model/blog');
const { checkForAuthentecationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT|| 8000;

// 'mongodb://localhost:27017/blogify'

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./view"));

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.use(checkForAuthentecationCookie("token"));

app.get('/', async(req, res)=>{
  const allBlogs = await Blog.find({})
    res.render('home',{
      user : req.user,
      blogs: allBlogs,
    });
});
app.use('/user', userRoute);
app.use('/blog', blogRoute)



app.listen(PORT, ()=> console.log(`sever is started at PORT:${PORT}`));