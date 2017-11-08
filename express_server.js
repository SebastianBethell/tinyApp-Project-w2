const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//http://localhost:8080/
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//lists all my url database and has link to shorten an URL
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//left over from source code
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//input: urls/*SHORTURL*   output: takes you to urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

//input: /u/*SHORTuRL*    output: redirects to the long version of the website
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//this gets called when user enters website into form and hits submit.  adds http:// to website entered and redirects you to urls/*SHORTURL*
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters.
  urlDatabase[rString] = 'http://' + req.body['longURL'];
  res.redirect(`http://localhost:8080/urls/${rString}`);
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
