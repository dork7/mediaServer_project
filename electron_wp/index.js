const { app, BrowserWindow } = require('electron')
var express = require('express')
var $ = require('jQuery');
 
var expressAPP = express()

// PORT automatically setting
// env variaable is set in bash using `export PORT=5000`
const port = process.env.PORT || 3000;

 
  let winYoutube;

function createWindow () {

  expressAPP.listen(port, ()=>{console.log(`listennign port ${port} ..........`);});


    expressAPP.get('/', (req, res)=>{
    
    var url = req.query.url;
    console.log(url);

 

  if( url == 'KILL_app'){
    if (winYoutube)
     { winYoutube.close();
           winYoutube = null;
     }
  }
  else if( url.includes("youtuzz")) {
    if (!winYoutube)
    {  
    winYoutube = new BrowserWindow({
   
          //frame: false,
          webPreferences: {
            nodeIntegration: true
          }
      })
     winYoutube.maximize();
     //winYoutube.loadURL(url);
    }
    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    if(videoid[1] != "") {
      console.log("video id = ",videoid[1]);
      winYoutube.loadURL('https://www.youtube.com/embed/'+videoid[1]+'?rel=0&autoplay=1');
    } 

    else { 
        console.log("The youtube url is not valid.");
    }
     
    //win.loadURL('https://www.youtube.com/embed/VIDEO_ID');
    }
    else {
    console.log("else");
    if (!winYoutube)
    {  
    winYoutube = new BrowserWindow({
   
          //frame: false,
          webPreferences: {
            nodeIntegration: true
          }
      })
     winYoutube.maximize();
     winYoutube.loadURL(url);
    }

    }

  //  winYoutube.setFullScreen(false);
    var response = { 'appRun' : 'status' , 'url' : url};
    console.log(response);
    res.send(response);

  });

  expressAPP.post('/' , (req , res ) => {

    // validate the input 
    // const result = validateCourse(req.body);
    
    console.log("post req");

});


  // Create the browser window.
  let win = new BrowserWindow({
    width: 200,
    height: 200,
   // frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

    win.hide(); 
 // win.setFullScreen(true);


  // win.loadURL('https://www.youtube.com/embed/I96uPDifZ1w?rel=0&autoplay=1');

  // and load the index.html of the app.
 


}



app.whenReady().then(createWindow)