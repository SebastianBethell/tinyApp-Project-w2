const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))

//sets up my urlDatabase hardcoded with 2 websites
const urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userID: "userRandomID"
  }
};

//sets up my users database hardcoded with 2 users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('1', 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('2', 10)
  }
}

//http://localhost:8080/
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect(`http://localhost:8080/urls/`);
  } else {
    res.redirect(`http://localhost:8080/login`);
  }
  res.end("Hello!");
});


//page to enter new urls to be shortened
//renders urls_new
app.get("/urls/new", (req, res) => {
  let templateVars = {   user_id: req.session.user_id, userList: users };
  res.render("urls_new", templateVars);
});

//main page.
//renders urls_index
app.get("/urls", (req, res) => {
  let usersUrlDatabase = urlsForUser(req.session.user_id);
  let templateVars = {  user_id: req.session.user_id, urls: usersUrlDatabase, userList: users };
  res.render("urls_index", templateVars);
});

//when user hits edit or goes to urls/id this renders urls_show
app.get("/urls/:id", (req, res) => {
  let templateVars = {  user_id: req.session.user_id, urls: urlDatabase, shortURL: req.params.id, userList: users };
  res.render("urls_show", templateVars);
});

//redirects to the long version of the website
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longUrl;
    res.redirect(longURL);
  } else {
    res.status(403).send('This short url does not exist!');
  }

});

//registration page
//if user is logged in redirects to /urls
app.get("/register", (req, res) => {
  if (users[req.session.user_id]){
    res.redirect(`http://localhost:8080/urls/`);
  }
  let templateVars = {  user_id: req.session.user_id, userList: users };
  res.render("urls_register", templateVars);
});

//login page
//if user is logged in redirects to /urls
app.get("/login", (req, res) => {
  if (users[req.session.user_id]){
    res.redirect(`http://localhost:8080/urls/`);
  }
  let templateVars = { user_id: req.session.user_id, userList: users};
  res.render("urls_login", templateVars);
});


//this gets called when user enters website into form and hits submit.  adds http:// to website entered and redirects you to urls/*SHORTURL*
//all checks done in the html
app.post("/urls", (req, res) => {
  let nString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz');
  urlDatabase[nString] = {
    longUrl: 'http://' + req.body['longURL'],
    userID: req.body['uid']
  };
  res.redirect(`http://localhost:8080/urls/${nString}`);
});

//deletes the urls from out database - no checks!
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`http://localhost:8080/urls/`);
});

//update long url to new url
//activates when user presses submit on the edit page
//checks that you are logged in then updates the longurl to the newly requested version
app.post("/urls/:id/", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.body.uid){
      urlDatabase[req.params.id].longUrl = req.body['newLongUrl'];
  res.redirect(`http://localhost:8080/urls/`);
  } else {
    res.status(403).send('You must be logged in to change an URL');
  }

});

//Activates when user submits email and password for logging in
//uses bcrypton password for security. checks if email inputed matches any in the user database then compaes the passwords.
//If no match send status 403
app.post("/login", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let validEmail = false;

  for (userKeys in users) {
    if (users[userKeys].email === req.body.email){
       validEmail = true;
       if (bcrypt.compareSync(password, users[userKeys].password)) {//if (bcrypt.compareSync(users[userKeys].password, hashedPassword)) {
        req.session.user_id = userKeys;
        res.redirect(`http://localhost:8080/urls/`);
      } else {
        return res.send("Password does not match email provided").status(403);
      }
    }
  }
  if (!validEmail) {
       return res.send("Email does not belong to any current user in our database");  //if going through the full loop it hits here send email not found
    }
});

//logout - clears the user_id cookie
app.post("/logout", (req, res) => {
  req.session = null;
    console.log(users);
  res.redirect(`http://localhost:8080/urls/`);
});

// register - also confirms the email is unique and that there are entries in both the email and password fields
app.post("/register", (req, res) => {
  let regString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz');
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.password === '' || req.body.email === ''){
    res.send("You need to input both an email and a password. Go back to try again.").status(403);
    return;
  }
  for (user in users){
    if (req.body.email === users[user].email){
      res.send("mail already belongs to another user.  Please go back and try again.").status(403);
      return;
    }
  }
  users[regString] = {
    id: regString,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = users[regString].id;
  res.redirect(`http://localhost:8080/urls/`);
});



/**
 * @param  {string} - takes in the id of the user to compare to the id tag on the urls
 * @return {object} - returns an object that is the subset of the urlDatabase object with the urls that belong to the user id
 */
function urlsForUser(id) {
  let urlDatabaseForUser = {};
  for (urlID in urlDatabase){
    if (urlDatabase[urlID].userID === id) {
      urlDatabaseForUser[urlID] = urlDatabase[urlID];
    }
  }
  return urlDatabaseForUser;
}



//random number generator - used for user id and url id
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
