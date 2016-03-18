"use strict";
var db = require('../db');
var request = require('request');
module.exports = {
  handlePost: function (req, res, next) {

  },

  postUser: function (profile, token) {
    var gitId = profile.id;
    var gitHandle = profile.login;
    var avatar = profile.avatar_url;
    var name = profile.name;
    var userQry = "SELECT id FROM users WHERE github_id='" + gitId.toString() + "'";
    // Check if user is in table
    db.query(userQry, function (err, results) {
      if (err) {
        throw new Error(err);
      }
      // If user NOT in table, add user
      if (results.length === 0) {
        var addUser = "INSERT into users (git_handle, name, github_id, github_avatar, git_token) VALUES ('"+ gitHandle +"','"+ name +"','"+ gitId +"','"+ avatar +"','"+ token +"')";
        db.query(addUser, function (err, results) {
          if (err) {
            throw new Error(err);
          } else {
            return results;
          }
        });
      } else {
        // If user is in the table check if git token has changed
        var tokenQry = "SELECT git_token FROM users where github_id='" +gitId.toString()+ "'";
        db.query(tokenQry, function(err, result) {
          if (err) {
            throw new Error(err);
          } else if(result[0].git_token !== token){
            // If the tokens are not equal update token
            var updateToken = "UPDATE users SET git_token='"+token+"' WHERE github_id='"+gitId+"'";
            db.query(updateToken, function (err, results) {
              if (err) {
                throw new Error(err);
              } else {
                return results;
              }
            });
            return result;
          }
        });
      }
    });
  },

  getToken: function (gitID, cb) {
    console.log('gitID ', gitID);
    var tokQry = "SELECT git_token FROM users WHERE github_id='" +  gitID.toString() + "'";
    db.query(tokQry, function (err, result) {
      if (err) {
        throw new Error(err);
      } else {
        console.log('token result: ', result[0].git_token);
        cb(result[0].git_token);
      }
    });
  },

  userSub: function (req, res, next) {
    var id  = req.cookies.githubId;
    var gitHandle = req.cookies.githubName;
    var token;
    module.exports.getToken(id,function(token){
      token = token;
      var options = {
        url: "https://api.github.com/users/"+ gitHandle +"/subscriptions",
        headers: {
          'User-Agent': 'GitSpy',
          authorization: 'token '+ token,
          'content-type': 'application/json'
        },
      };
      request.get(options, function(error, response, body) {
        if (error){
          throw new Error(error);
        } else {
          res.end(body);
        }
      });
    });
  }

};
