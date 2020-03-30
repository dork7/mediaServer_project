openURL2();

function openURL1(){
    var url = 'http://localhost:3000';
    var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    requre('child_process').exec(start + ' ' + url);
}

function openURL2(){
    var open = require('open');
    open('http://localhost:3000');
}