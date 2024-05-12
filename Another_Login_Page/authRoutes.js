// // authentication routes
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDb } = require("./db");
const router = express.Router();
const verifyToken = require("./authMiddleware");
const { body, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
router.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});
router.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
// validate username and password and email using express-validator

router.post(
  "/signup",
  body("username")
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .isAlphanumeric()
    .withMessage("Please enter valid username"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password must not be empty")
    .isLength({ min: 6, max: 15 })
    // .withMessage("Password must be between 6 and 15 characters")
    // .isUppercase()
    // .withMessage("Password must contain at least one uppercase letter")
    // .isLowercase()
    // .withMessage("Password must contain at least one lowercase letter")
    // .isAlphanumeric()
    // .withMessage("Password must contain at least one number")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
    })
    .withMessage("Please enter valid password"),
  body("email").isEmail().withMessage("Please enter valid email"),
  async (req, res) => {
    console.log(req.body);
    //validation error message
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password, email } = req.body;
    try {
      const db = getDb();
      //check if username or email already exists
      console.log(username, email);
      const user = await db
        .collection("users")
        .findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Username or email already exists" }] });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const newUser = await db
        .collection("users")
        .insertOne({ username: username, password: hash, email: email });
      //   create a html response with inline css  and redirect to login page
      res.status(201).redirect("./login.html");
      //redirect to login.html page if registration is successful
      // res.redirect("./login.html");

      // res.status(201).json({ msg: "User created" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  }
);
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    const db = getDb();
    const user = await db.collection("users").findOne({ username: username });
    if (!user) {
      // return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      res.status(400).redirect("/login.html");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    //generate a JWT token
    const token = jwt.sign(
      { username: user.username },
      Process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/Landing Page/index.html");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
});
router.post("/checkUsername", async (req, res) => {
  const { username } = req.body;
  try {
    const db = getDb();
    const user = await db.collection("users").findOne({ username: username });
    if (user) {
      return res.send("Username already exists");
    }
    res.status(201).send("");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
});
router.post("/checkEmail", async (req, res) => {
  const { email } = req.body;
  try {
    const db = getDb();
    const user = await db.collection("users").findOne({ email: email });
    if (user) {
      return res.send("Email already exists");
    }
    res.status(201).send("");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
});

//// Middleware to verify JWT and protect routes
// const checkToken = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, "secret"); // Replace with your own JWT secret key
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     res.status(401).json({ message: "Invalid token." });
//   }
// };

// router.post("/signup", checkToken, async (req, res) => {
//   // Signup logic
//   // Generate JWT upon successful signup
//   const token = jwt.sign({ email: req.body.email }, "secret"); // Replace with your own JWT secret key

//   res.status(201).json({ message: "User registered successfully", token });
// });

router.get("/protected", verifyToken, (req, res) => {
  // Protected route handler
  // Access user information from req.user
  const username = req.user.username;

  res.json({ message: `Protected route accessed by ${username}` });
});
module.exports = router;
