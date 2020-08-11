var express = require("express");
var router = express.Router();
const mongo = require("../lib/mongo");
const gmail = require("../lib/gmail");
const gmailTest = require("../lib/gmailTest");
var {SHA256} = require("crypto-js");

router.get("/", (req, res) => {

});

router.get("/mongo", (req, res) => {
  mongo.viewDB("userInfo", (docs) => res.json(docs));
});

router.delete("/mongo", (req, res) => {
  mongo.clearCollection("userInfo");
  res.send(200);
});

// Create a new login session
router.post("/login", async (req, res) => {
  let username = req.body["username"];
  let password = SHA256(req.body["password"]).toString();

  // Check if user login info is correct
  if(await mongo.findDocument({username: username, password: password}, "userInfo")){
    res.status(200).send("Ok");
    return;
  }
  else{
    res.status(404).send("Not Found");
    return;
  }
});

router.get("/test", (req, res) => {
  let content = "To: <kevinyluo@gmail.com>\nSubject: Confirmation\n\nHere is your code: 345";
  let raw = Buffer.from(content).toString('base64');
  gmail.sendMessage(raw);
  res.send(raw);
});

// Endpoint for adding new user data
router.post("/new-user", async (req, res) => {
  let email = req.body["email"];
  let name = req.body["name"];
  let username = req.body["username"];
  let password = req.body["password"];
  let date = new Date();

  // Return an error if any field is empty
  if ((!email || !name || !username || !password)){
    res.status(400).send("Bad Request");
    return;
  }

  // Check if username or email already exists
  if(await mongo.findDocument({email: email}, "userInfo")){
    res.status(409).send("Email Already Exists");
    return;
  }
  if(await mongo.findDocument({username: username}, "userInfo")){
    res.status(409).send("Username Already Exists");
    return;
  }

  let code = Math.floor(Math.random() * 999999);

  // Send an email with the code
  let content = "To: <"+email+">\nSubject:"+code+" is your code\n\nHi,\nSomeone tried to sign up for an EverythingJennie account with "+email+". If it was you, Enter this confirmation code:\n\n"+code;
  let raw = Buffer.from(content).toString('base64');
  gmail.sendMessage(raw);

  // Create a document with all user info
  let user = {
    email: email,
    name: name,
    username: username,
    password: SHA256(password).toString(),
    creationDate: date.toString(),
    verified: code,
  };

  // Add document to the database
  mongo.addDocument(user, "userInfo");
  res.status(201).send("Created");
});

router.post("/verify", async (req, res) => {
  let email = req.body["email"];
  let code = req.body["code"];

  // Return an error if a field is empty
  if (!email || !code){
    res.status(400).send("Bad Request");
    return;
  }

  let doc = await mongo.findDocument({email: email}, "userInfo");
  // return 404 error if user is not found
  if(!doc){
    res.status(404).send("Not Found");
    return;
  }

  // Check if the code is correct
  if (doc["verified"] == code){
    mongo.updateDocument(email, "verified", true, "userInfo");
    res.status(200).send("Ok");
  }
  else if (doc["verified"] == true){
    res.status(409).send("Already verified");
  }
  else{
    res.status(401).send("Unauthorized");
  }
});

module.exports = router;
