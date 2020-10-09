var express = require('express')
const Joi = require('joi') // class for validation of input data 


var app = express()


app.use(express.json()); //  this method returns middleware // idk what it gonn do :3

const courses = [
{ id : 1 , name :  'name 1'},
{ id : 2 , name :  'name 2'},
{ id : 3 , name :  'name 3'},
];

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

app.post('/' , (req , res ) => {

	// validate the input 
	// const result = validateCourse(req.body);
	
	console.log("post req");

});


