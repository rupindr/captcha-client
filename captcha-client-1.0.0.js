/*
Copyright 2018 Rupinder Singh
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var CaptchaClient = function(rootElement, apiUri){
    this.rootElement = rootElement;
    this.apiUri = apiUri[apiUri.length-1] == '/' ? apiUri.slice(0, apiUri.length-1) : apiUri;
    this.checkCaptchaApiUri = '/captcha-client/checkcaptcha';
    this.getCaptchaApiUri = '/captcha-client/getcaptcha';
    this.captchaClientId = 'captcha-client-' + Math.random().toString(36).slice(-5);
    this.canvasId = 'captcha-canvas-' + Math.random().toString(36).slice(-5);
    this.userResId = 'user-response-' + Math.random().toString(36).slice(-5);
    this.submitBtnId = 'capthca-submit-' + Math.random().toString(36).slice(-5);
    this.reloadBtnId = 'capthca-reload-' + Math.random().toString(36).slice(-5);
    this.isPassed = false;
    this.numberOfReloads = -1;

    // custom event listeners
    this.test = undefined;
    this.fail = undefined;
    this.pass = undefined;
    this.load = undefined;
    this.reload = undefined;

    /**
     * add canvas and form fields to DOM
     */
    this.loadDOM = (function(){
        this.rootElement.innerHTML = 
        `<div id=`+ this.captchaClientId +` style="border: 2px solid black;">
            <table style="width: 100%;">
                <tr>
                    <td colspan="3">
                        <canvas id=`+ this.canvasId +`>Your browser does not support the HTML5 canvas tag.</canvas>
                    </td>
                </tr>
                <tr>
                    <td><input style="width: 90%;" id=`+ this.userResId +` type="text"></input></td>
                    <td><button id=`+ this.submitBtnId +`>Submit</button></td>
                    <td><button id=`+ this.reloadBtnId +`>&#x21bb;</button></td>
                </tr>
            </table>
        </div>`;

        document.getElementById(this.submitBtnId).addEventListener('click', this.captchaCheck);
        document.getElementById(this.reloadBtnId).addEventListener('click', this.loadCaptcha);

    }).bind(this);

    /**
     * get pixel data from server
     */
    this.loadCaptcha = (function(){
        this.numberOfReloads = this.numberOfReloads + 1;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (function () {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                this.processPixelData(JSON.parse(xhr.responseText));
            }
        }).bind(this);
        xhr.open('GET', this.apiUri + this.getCaptchaApiUri, true);
        xhr.send();
    }).bind(this);

    /**
     * generate image from pixel data
     */
    this.processPixelData = (function(res){
        var capCanvas=document.getElementById(this.canvasId);
        var capCanvasContext=capCanvas.getContext('2d');
        var imgData = capCanvasContext.createImageData(res.width,res.height);

        capCanvasContext.canvas.height = res.height;
        capCanvasContext.canvas.width = res.width;
        document.getElementById(this.captchaClientId).style.width = res.width + 10 + 'px';
        if(res.width < 120){
            document.getElementById(this.submitBtnId).innerHTML = '&#10004';
        }
        for (var i = imgData.data.length - 1; i >= 0; i--) {
            if(res.imgData[i]){
                imgData.data[i] = res.imgData[i];
            }
            else{
                imgData.data[i] = 0;
            }
        }
        capCanvasContext.putImageData(imgData, 0, 0);
        document.getElementById(this.userResId).value = '';
        document.getElementById(this.userResId).focus();
        if(this.load && this.numberOfReloads == 0){
            this.load();
        }
        if(this.reload && this.numberOfReloads > 0){
            this.reload();
        }
    }).bind(this);

    /**
     * test captcha against user response
     */
    this.captchaCheck = (function(){
        var xhr = new XMLHttpRequest();
        var answer = document.getElementById(this.userResId).value;
        xhr.onreadystatechange = (function () {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                this.handleCaptchaResponse(JSON.parse(xhr.responseText));
            }
        }).bind(this);
        xhr.open('POST', this.apiUri + this.checkCaptchaApiUri, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify({ answer: answer }));
    }).bind(this);

    /**
     * take action according to captcha passed or not
     */
    this.handleCaptchaResponse = (function(res){
        if(res.status === 'passed'){
            this.isPassed = true;
            document.getElementById(this.captchaClientId).style.borderColor = 'green';
            document.getElementById(this.userResId).disabled = 'true';
            document.getElementById(this.reloadBtnId).disabled = 'true';
            document.getElementById(this.submitBtnId).disabled = 'true';
            if(this.pass){
                this.pass();
            }
        }
        else{
            this.isPassed = false;
            document.getElementById(this.captchaClientId).style.borderColor = 'red';
            document.getElementById(this.userResId).value = '';
            document.getElementById(this.userResId).focus();
            if(this.fail){
                this.fail();
            }
            this.loadCaptcha();
        }
        if(this.test){
            this.test(this.isPassed);
        }
    }).bind(this);

    /**
     * add event listeners to captcha
     */
     this.on = function(eventName, callback){
        if(typeof callback != 'function'){
            return;
        }
        if(eventName == 'test'){
            this.test = callback;
        }
        if(eventName == 'load'){
            this.load = callback;
        }
        if(eventName == 'fail'){
            this.fail = callback;
        }
        if(eventName == 'pass'){
            this.pass = callback;
        }
        if(eventName == 'reload'){
            this.reload = callback;
        }
     }

    //load captcha when object is created
    this.loadDOM();
    this.loadCaptcha();
}