const apiURL = 'http://nestedspace.ddns.net:5000/finance/api/';

//TODO: include auth for user
function getRequestToAPI(suffix, callback){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', apiURL + suffix, true);
    xhr.onload = function(){
        callback(true, JSON.parse(this.responseText));
    } 
    xhr.onerror = function(){
        callback(false, {});
    }
    xhr.send();
}

