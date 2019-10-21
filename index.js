var request = require('request');

function xfinityUsage(username, password, callback) {
  //console.log("Finding reqId for login...")
  request.get('https://customer.xfinity.com/oauth/force_connect/?continue=%23%2Fdevices', function(err, resp, body) {
    //console.log(resp.statusCode);
    
    var m = body.match(/<input type="hidden" name="reqId" value="(.*?)">/);
    reqId = m[1];
    //console.log("reqId", reqId);

    data = {
      'user': username,
      'passwd': password,
      'reqId': reqId,
      'rm': 'true',
      'deviceAuthn': 'false',
      's': 'oauth',
      'forceAuthn': '1',
      'r': 'comcast.net',
      'ipAddrAuthn': 'false',
      'continue': 'https://oauth.xfinity.com/oauth/authorize?client_id=my-account-web&prompt=login&redirect_uri=https%3A%2F%2Fcustomer.xfinity.com%2Foauth%2Fcallback&response_type=code&state=%23%2Fdevices&response=1',
      'passive': 'false',
      'client_id': 'my-account-web',
      'lang': 'en',
    }

    //console.log("Posting to login...")
    var session = request.defaults({jar: true});
    session.post({url: 'https://login.xfinity.com/login', form: data, followAllRedirects:true}, function(err, resp, body) {
      //console.log(err);

      //console.log("Fetching internet usage...")

      session.get({url: 'https://customer.xfinity.com/apis/services/internet/usage', json:true}, function(err, resp, body) {
        //console.log(body);
        if(!body.hasOwnProperty('usageMonths')) {
          return callback({}, body);
        }
        var current = body['usageMonths'].slice(-1)[0];

        var rate = Math.round(((current.homeUsage / current.allowableUsage) / ((new Date()).getDate() / (new Date(current.endDate)).getDate()))*100);

        var out = {
          'used': current['homeUsage'],
          'total': current['allowableUsage'],
          'unit': current['unitOfMeasure'],
          'rate': rate
        }

        callback(out);
      });
    });
  });
};

module.exports = xfinityUsage;

