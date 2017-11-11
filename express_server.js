const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

//seys up my urlDatabse hardcoded with2 websites
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//sets up my users database hardcoded with 2 users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "pass1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "pass2"
  }
}

//http://localhost:8080/
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {   user_id: req.cookies["user_id"], userList: users };
  res.render("urls_new", templateVars);
});

//lists all my url database and has link to shorten an URL
app.get("/urls", (req, res) => {
  let templateVars = {  user_id: req.cookies["user_id"], urls: urlDatabase, userList: users };
  res.render("urls_index", templateVars);
});

//left over from source code
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//input: urls/*SHORTURL*   output: takes you to urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = {  user_id: req.cookies["user_id"], urls: urlDatabase, shortURL: req.params.id, userList: users };
  res.render("urls_show", templateVars);
});

//input: /u/*SHORTuRL*    output: redirects to the long version of the website
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//howusers register email password
app.get("/register", (req, res) => {
  let templateVars = {  user_id: req.cookies["user_id"], userList: users };
  res.render("urls_register", templateVars);
});

//new log in method
app.get("/login", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], userList: users};
  res.render("urls_login", templateVars);
});


//this gets called when user enters website into form and hits submit.  adds http:// to website entered and redirects you to urls/*SHORTURL*
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters.
  urlDatabase[rString] = 'http://' + req.body['longURL'];
  res.redirect(`http://localhost:8080/urls/${rString}`);
});

//deletes the urls from out database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`http://localhost:8080/urls/`);
});

//update long url to new requested url
app.post("/urls/:id/", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body['newLongUrl']
  res.redirect(`http://localhost:8080/urls/${req.params.id}`);
});


//checks if your password and email back an excisting user if so it logs you in if not 403 status code sent back
app.post("/login", (req, res) => {
  for (userKeys in users) {
    if (users[userKeys].email === req.body.email){
      console.log(' email matches an existing user');
      if (users[userKeys].password === req.body.password) {
        console.log('password matches an existing user');
        res.cookie('user_id', userKeys);
        res.redirect(`http://localhost:8080/urls/`);
      } else {
        res.status(403).send('Password does not match email provided');
      }
    }
  }
  res.status(403).send('Email not found');
});

//logout using cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`http://localhost:8080/urls/`);
});

// register email password
app.post("/register", (req, res) => {
  //let templateVars = {  user_id: req.cookies["user_id"], userList: users };
  let tempId = rString;
  users[tempId] = {
    id: tempId,
    email: req.body.email,
    password: req.body.password
  };
  res.redirect(`http://localhost:8080/urls/`);
});



//random number generator
let rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz');

function generateRandomString(chars) {
    let result = '';
    for (let i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

//listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
