var express = require('express')
const Joi = require('joi') // class for validation of input data 
const { VLC } = require('node-vlc-http');
var http = require('http');


var app = express()


app.use(express.json()); //  this method returns middleware // idk what it gonn do :3


// PORT automatically setting
// env variaable is set in bash using `export PORT=5000`
const port = process.env.PORT || 2266;

app.listen(port, ()=>{console.log(`listennign port ${port} ..........`);});



// ##### //app.get();


// tested with postman // http://localhost:3000?url=https://www.google.com

app.get('/', (req, res)=>{
	
	var url = req.query.url;
	console.log(url);
	var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
	var status = require('child_process').exec(start + ' ' + url);

	var response = { 'appRun' : 'status' , 'url' : url};
// console.log(response);
res.send(response);

});

app.post('/vlc/pause' , (req , res ) => {

	let vlcCMD = "pl_pause";
 
	res.send(vlcCall(vlcCMD));

});
app.post('/vlc/play' , (req , res ) => {

	let vlcCMD = "pl_pause";
	res.send(vlcCall(vlcCMD));
});

app.post('/vlc/stop' , (req , res ) => {

	let vlcCMD = "pl_stop";
	res.send(vlcCall(vlcCMD));
});

app.post('/vlc/next' , (req , res ) => {

	let vlcCMD = "pl_next";
	res.send(vlcCall(vlcCMD));
});

app.post('/vlc/previous' , (req , res ) => {

	let vlcCMD = "pl_previous";
	res.send(vlcCall(vlcCMD));
});

app.post('/vlc/previous' , (req , res ) => {

	let vlcCMD = "pl_previous";
	res.send(vlcCall(vlcCMD));
});

app.post('/vlc/previous' , (req , res ) => {

	let vlcCMD = "pl_previous";
	res.send(vlcCall(vlcCMD));
});



function vlcCall(vlcCMD){
	// working
	var url = "http://127.0.0.1:8080/requests/status.xml?command="+vlcCMD+"";

	var username = "";
	var password =123;
	var options = {
		host: "localhost",
		port: 8080,
		method: "GET",
	    path: url,//I don't know for some reason i have to use full url as a path
	    auth: username + ':' + password
	};

	http.get(options, function(rs) {
		var result = "";
		rs.on('data', function(data) {
			result += data;
		});
		rs.on('end', function() {
			console.log(result);
			return result;
		});
	});

}





