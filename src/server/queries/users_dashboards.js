"use strict";

var pool = require('../db/index.js').getPool();

module.exports = {
  // NOTE: by "return", we really mean "pass to callback as results arg"

  getOne: function (githubId, dashboardId, callback) {
    // return matching users_dashboards record
    var selectStr = "SELECT * FROM users_dashboards WHERE users_github_id=" + githubId + " AND dashboards_id=" + dashboardId + ";";
    pool.query(selectStr, function (err, results) {
      if (err) {
        callback(err, null);
      } else {
        var recordObject = (results && results.length > 0) ? results[0] : null;
        callback(null, recordObject);
      }
    });
  },
  associateUser: function (githubId, dashboardId, callback) {
    // create a new users_dashboards record if one doesn't yet exist, with set_up initialized to 0
    // if record exists already, do nothing
    // no need to return anything (we don't think)

    // call getOne to see if users_dashboards record already exists
    this.getOne(githubId, dashboardId, function (err, result) {
      if (err) {
        callback(err, null);
      } else if (result) {
        // record DOES exit
        callback(null, "User already associated with dashboard");
      } else {
        // record DOES NOT exist - create new one
        // use simple githubId + dashboardId concatenation for "hash" for now, guarantees uniqueness. substitute a proper hash later
        var signatureHash = githubId.toString + '@' + dashboardId.toString();
        var insertStr = "INSERT INTO users_dashboards (users_github_id, dashboards_id, set_up, signature_hash) VALUES (" + githubId.toString() + ", " + dashboardId.toString() + ", 0, '" + signatureHash + "');";
        pool.query(insertStr, function (err, results) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, "User associated with dashboard");
          }
        });
      }
    });
  },
  setUpTrue: function (signatureHash, callback) {
    // for that users_dashboards record, set set_up to 1
    // no return value
  },
  deleteOne: function (signatureHash, callback) {
    // delete record with matching signature_hash
    // no return value
  }
};
