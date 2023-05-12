let request = require("request");

let apiRequest = (endpoint, httpmethod, body, success, failure) =>
    request({
        uri: `https://api.rebrandly.com/v1/${endpoint}`,
        method: httpmethod,
        body: body ? JSON.stringify(body) : null,
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'YOUR_API_KEY'
        }
    }, (err, response, body) => {
        if (err) failure(JSON.parse(err));
        else success(JSON.parse(body));
    })


let getRequest = (endpoint, success, failure) => {
    return apiRequest(endpoint, "GET", null, success, failure)
}

let postRequest = (endpoint, body, success, failure) => {
    return apiRequest(endpoint, "POST", body, success, failure)
}

let getAccount = (success, failure) => {
    return getRequest("account", success, failure);
}

let createNewLink = (link, success, failure) => {
    return postRequest("links", link, success, failure);
}

exports.getAccount = getAccount;
exports.createNewLink = createNewLink;