import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 10 MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('img');

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Array to store blog posts
let blogs = [];

app.get("/", (req, res) => {
  res.render("index", { blogs: blogs });
});

app.get("/write.ejs", (req, res) => {
  res.render("write.ejs");
});

app.post("/submit", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.redirect("/");
    } else {
      const newBlog = {
        id: uuidv4(), // Generate a unique ID for the blog post
        namee: req.body.fName,
        content: req.body.blog,
        title: req.body.title,
        image: req.file ? `/uploads/${req.file.filename}` : ''
      };
      blogs.push(newBlog);
      res.redirect("/");
    }
  });
});

// Edit blog route
app.get("/edit/:id", (req, res) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (blog) {
    res.render("edit", { blog: blog });
  } else {
    res.status(404).send('Blog not found');
  }
});

app.post("/update/:id", (req, res) => {
  const blogIndex = blogs.findIndex(b => b.id === req.params.id);
  if (blogIndex !== -1) {
    blogs[blogIndex].namee = req.body.fName;
    blogs[blogIndex].content = req.body.blog;
    blogs[blogIndex].title = req.body.title;
    // Note: For simplicity, we are not handling file upload for edit
  }
  res.redirect("/");
});

// Delete blog route
app.post("/delete/:id", (req, res) => {
  blogs = blogs.filter(b => b.id !== req.params.id);
  res.redirect("/");
});
 //read 
 app.get("/read/:id", (req, res) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (blog) {
    res.render("read", { blog: blog });
  } else {
    res.status(404).send('Blog not found');
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
