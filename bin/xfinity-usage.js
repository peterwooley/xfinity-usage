#! /usr/bin/env node
var xfinityUsage = require ('../index.js');
var username = process.env.XFINITY_USERNAME;
var password = process.env.XFINITY_PASSWORD;
xfinityUsage(username, password, console.log);
