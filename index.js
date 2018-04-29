var $ = document.getElementById.bind(document);
var dom = require("ace/lib/dom");
var themes = require("ace/ext/themelist").themes.map(function(t){return t.theme});
var compiledPython = '';
var output = '';
var pythonMode = false;

// create first editor
var editor = ace.edit("editor");
    editor.setOptions({
      mode: "ace/mode/coconut",
      theme: "ace/theme/tomorrow",
      maxLines: 30,
      minLines: 10,
      wrap: true,
      autoScrollEditorIntoView: true
    });
editor.renderer.setScrollMargin(10, 10);

//create the console
var editor2 = ace.edit("editor2");
editor2.setOptions({
    mode: "ace/mode/python",
    theme: "ace/theme/katzenmilch",
    maxLines: 15,
    minLines: 10,
    wrap: true,
    autoScrollEditorIntoView: true
});
editor2.renderer.setShowGutter(false);

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    return false;
}

// Create a tooltip
function createTip(ev){
    var title = this.title;
    if(this == savebutton){
        this.title = 'press "ctrl-S/cmd-S" to save';
    }
    else{
        this.title = 'press "ctrl-R/cmd-R" to run';
    }
    this.setAttribute("tooltip", title);
    var tooltipWrap = document.createElement("div"); //creates div
    tooltipWrap.className = 'tooltip'; //adds class
    tooltipWrap.appendChild(document.createTextNode(title)); //add the text node to the newly created div.
    var firstChild = document.body.firstChild;//gets the first elem after body
    firstChild.parentNode.insertBefore(tooltipWrap, firstChild); //adds tt before elem 
    var padding = 5;
    var linkProps = this.getBoundingClientRect();
    var tooltipProps = tooltipWrap.getBoundingClientRect(); 
    var topPos = linkProps.top - (tooltipProps.height + padding);
    tooltipWrap.setAttribute('style','top:'+topPos+'px;'+'left:'+linkProps.left+'px;')
}

function cancelTip(ev){
    var title = this.getAttribute("tooltip");
    this.title = title;
    this.removeAttribute("tooltip");
    document.querySelector(".tooltip").remove();
}

//Save as Python button 
var pythonCheckbox = document.querySelector('input[value="pythonFile"]');
var pythonText = document.querySelector('input[id="pythonbutton"]');
//pythonText.style.visibility = 'hidden';

pythonCheckbox.onchange = function() {
  if(pythonCheckbox.checked) {
    pythonMode = true;
  } else {
    pythonMode = false;
  }
};

//handle
var resizeHandle = document.getElementById('handle');
var editor1Size = document.getElementById('editor');
var editor2Size = document.getElementById('editor2');
resizeHandle.addEventListener('mousedown', initialiseResize, false);
function initialiseResize(e) {
    if(!e) e = window.event;
    window.addEventListener('mousemove', startResizing, false);
    window.addEventListener('mouseup', stopResizing, false);
}
function startResizing(e) {
    if(!e) e = window.event;
    var ScreenHeight = window.screen.height;
    //console.log("Screen height is" + ScreenHeight);
    editor1Size.setAttribute('style','height:'+(e.clientY - 60)+'px;');
    editor2Size.setAttribute('style','height:'+(ScreenHeight * 0.8 - e.clientY)+'px;');
}
function stopResizing(e) {
    if(!e) e = window.event;
    window.removeEventListener('mousemove', startResizing, false);
    window.removeEventListener('mouseup', stopResizing, false);
}

// //Handle resizing 
// function handleResizeWindow(e){
//     var newScreenHeight = window.screen.height;
//     editor1Size.setAttribute('style','height:'+(newScreenHeight * 0.45)+'px;');
//     editor2Size.setAttribute('style','height:'+(newScreenHeight * 0.45)+'px;');
// }

//Coconut Wrapper
(function coconutWrapper($) {

    (function(){
        // Add a tooltip
        savebutton.addEventListener('mouseover',createTip);
        savebutton.addEventListener('mouseout',cancelTip);
        runbutton.addEventListener('mouseover',createTip);
        runbutton.addEventListener('mouseout',cancelTip);
        //window.addEventListener("resize", handleResizeWindow);
    })()

    function sendDataToCoco(interpret = true,filename = null){
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/python-coconut',            
            data: JSON.stringify({
                "code" : editor.getValue()
            }),
            contentType: 'application/json',
            success: function(data){
                compiledPython = data;
                if (interpret == true){
                    sendData(data);
                }
                else{
                    wait(2000);
                    console.log(compiledPython);
                    download(filename+".py", compiledPython);
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting code: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                editor2.setValue(">>> " + data);
                alert('An error occured when interpreting your code:\n' + jqXHR.responseText);
            }
        });
        return false;
    }

    function sendData(code){
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/interpret',            
            data: JSON.stringify( {
                "code" : code
            }),
            contentType: 'application/json',
            timeout: 25000,
            success: function(data){
                if(data.errorMessage){
                    // get error message, type, and traceback in compiled python code
                    var message = data.errorMessage;
                    var errorType = data.errorType;
                    var stackTrace = data.stackTrace;

                    // locate the line number for error in compiled python code
                    var arr    = String(stackTrace[1]).split(',');
                    var lineNumber = arr[1];

                    // Go back to the compiled python code, for the line 
                    // that error occurs
                    var lines = String(compiledPython).split('\n');
                    var line = lines[parseInt(lineNumber)-1];

                    // find the line it corresponds to in coconut code
                    var hash = line.split('#');
                    var correctLine = hash[hash.length - 1];

                    // display the true line number of where error occurs
                    editor2.setValue(">>> " + message + '\n' + ">>> " + errorType
                     + '\n' + ">>> " + "Error occurs at" + correctLine + '\n');
                }
                else{
                    if (data == ""){
                       data = "null"; 
                    }
                    console.log("changed to last");
                    editor2.setValue(">>> " + data.replace(/\n|\r(?=.{3,}$)/g, '\n'+'>>> '));
                }
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown)  {
                if(textStatus==="timeout") {
                   editor2.setValue("Oops, timeout, please check if you entered an infinite loop");
                }
                else{
                    console.error('Error requesting code: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    editor2.setValue(">>> " + data);
                    alert('An error occured when interpreting your code:\n' + jqXHR.responseText);
                }
                
            }
        });
        return false;
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#runbutton').click(function() {
            editor2.setValue(">>> LOADING.....");
            sendDataToCoco(true);    
        });
        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }


    });

    editor.commands.addCommand({
        name: "run",
        bindKey: { win: "Ctrl-R", mac: "Command-R" },
        exec: function (editor) {
                editor2.setValue(">>> LOADING.....");
                sendDataToCoco(true);
        }
    });

    editor.commands.addCommand({
        name: "save",
        bindKey: { win: "Ctrl-S", mac: "Command-S" },
        exec: function (editor) {
                savebutton.click();
        }
    });

    // Start file download.
    savebutton.addEventListener("click", function(){
        // Generate download of hello.txt file with some content
        var text = editor.getValue();
        var filename = prompt("Enter filename","index"); 
        if(filename){
            if(pythonMode == false){
                download(filename+".coco", text);
            }
            else{
                sendDataToCoco(false,filename);
                // console.log(compiledPython);
                // download(filename+".py", compiledPython);
            }
        }   
    }, false);

    function wait(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

}(jQuery));

    

