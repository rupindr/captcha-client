captcha-client
===========
"Just add water" captchas for your website. This project is client-side for the project [captcha-server](https://github.com/rupindr/captcha-server)

## Installation
Add following tag to your html
	`<script src="https://cdn.jsdelivr.net/gh/rupindr/captcha-client/captcha-client-1.0.0.min.js" ></script>`
## Usage
**1.Create a div where you want to place the captcha.**
	

    <div id="captcha-container" ></div>
	
**2.Create a new captcha object.**  

 It takes two parameters:
 * DOM element that is container for captcha
 * Api address where captcha-server is running.
 

    var captcha = new CaptchaClient(document.getElementById('captcha-container'), 'https://localhost:3001');
    
when object is created, div #captcha-container will be popoulated with a captcha.
**3.Adding event listeners.**  
captcha-client provides following events:
	

    captcha.on('load', function(){
        console.log("Loaded");
        // do something when captcha loads first time
    });
    captcha.on('reload', function(){
        console.log("Reloaded");
        // do something when captcha is reloaded
    });
    captcha.on('pass', function(){
        alert("Passed");
        // do something when captcha test is passed by user
    });
    captcha.on('fail', function(){
        alert("Try Again");
        // do something when user enters wrong characters
    });
    captcha.on('test', function(passed){
        console.log('Tested. Result is: ' + passed);
        // do something when user clicks on the submit button of captcha
    }); 
    
	



 **4.Checking if captcha test is passed or not:**    
 Use property `isPassed`.
 
    if(captcha.isPassed){ //returns true if captcha is passed
        //do something
    }

**6.See [Captcha Example](https://github.com/rupindr/captcha-example) to see how to integrate front-end and back-end.**

*Note:* This implimentation assumes that api end points for captcha-server are `/captcha-client/checkcaptcha` and `/captcha-client/getcaptcha`

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 1.0.0 Initial release
