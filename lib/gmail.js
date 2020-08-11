const fetch = require('node-fetch');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const url = "https://www.googleapis.com/gmail/v1/users/me/messages/send";

const TOKEN_PATH = 'token.json';

function send_message(token, content) {
  // Create a text body, containing message content
  let body = {
    raw: content
  };

  // Parameters of the API request
  let params = {
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body),
    method: 'post'
  }

  // Use Fetch to make the API request
  fetch(url, params)
  .then(data => data.json())
  .then(json =>{
    console.log(json);
  })
}

module.exports = {
  sendMessage: async (content) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      let json = JSON.parse(token);
      let access_token = json['access_token'];
      send_message(access_token, content)
    });
  }
}
