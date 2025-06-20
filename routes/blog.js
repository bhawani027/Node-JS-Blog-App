const { Router } = require("express");
const multer  = require('multer');
const path = require('path');
const router = Router();

const Blog = require("../model/blog");
const Comment = require("../model/comment");
const User = require('../model/user');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   return cb(null, path.resolve(`./public/uploads/${req.user._id}`));
  },
  filename: function (req, file, cb) {

    return cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({storage: storage})

router.get("/add-new", (req, res) => {
  return  res.render("addBlog",{
    user : req.user,
  });
});

router.get('/:id', async(req, res)=> {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({blogId: req.params.id}).populate('createdBy');
  return res.render("blog", {
    user : req.user,
    blog,
    comments
  });
});

router.post('/comment/:blogId', async(req, res)=> {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
 return res.redirect(`/blog/${req.params.blogId}`);
});

router.post('/', upload.single('coverImage'), async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`, // ✅ Correct
  });

  return res.redirect(`/blog/${blog._id}`);
});


module.exports = router;