//server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const router = require("./authRoutes");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// const express = require("express");
const app = express();
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 600000 },

//     // cookie: { secure: true },
//   })
// );

app.use(cookieParser());
// const path = require("path");

// const { router } = require("./authRoutes");

app.use(express.static(path.join(__dirname, "./")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

// app.get("/", (req, res) => {
//   res.redirect("login.html");
// });
// app.get("/signup", (req, res) => {
//   res.redirect("signup.html");
// });
// app.get("/login", (req, res) => {
//   res.sender("login.html");
// });
// app.get("signup", (req, res) => {
//   res.sender("signup.html");
// });

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
