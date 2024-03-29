

var antiFloodEnabled = true

// INJECTS

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

function injectScripts(){
    setTimeout(function(){
        injectScript(browser.runtime.getURL('js/injects.js'), 'body')
    }, 1);
    setTimeout(function(){
        injectScript(browser.runtime.getURL('js/xhrInspector.js'), 'body')
    }, 2);
}



// END INJECTS

// SUBSCRIBES

function xhrCallback(data){
    if (data.xhrData.status === "error"){
        // Check if it's antiflood error
        data.xhrData.errors.forEach( error =>{
            if (error.includes("must wait at least")){
                startAntiFlood(data, error)
                return
            }
        })
    }
    if (data.xhrData.status === "ok" && data.xhrData.url) {
        const actionName = data.xhrData.url.split('/').pop()
        if (actionName === 'add-reply') {
            startAutoCloseTab(data)
        }
    }
}

function subscribeToXhrListener(){
    window.addEventListener("getXhrData", function(data) {
        xhrCallback({
            url : data.srcElement.location.href,
            xhrData : data.detail.data
        }) 
    }, false);
}


// START AUTOCLOSETAB STUFF

var isAutoCloseCanceled = false

const checkIfAutoCloseIsCanceled = () => isAutoCloseCanceled

async function startAutoCloseTab (xhrData) {
    const shouldCloseTabSettings = await browser.storage.local.get("closeTabOnPost")
    let shouldCloseTab = shouldCloseTabSettings.closeTabOnPost === "yes"
    if (shouldCloseTab) {
       isAutoCloseCanceled = false
       insertCloseTabWarningButton(xhrData)
    }
}

function closeCurrentTab () {
     browser.runtime.sendMessage({
        command: "closeCurrentTab",
      });
}

const startAutoCloseCountdown = async (time) => {
    let isCanceled = false
    while ((time + 1) >= 0){
        await sleep(1000).then(() => {
            time--
            isCanceled = checkIfAutoCloseIsCanceled()     
        })
    }
    if (!isCanceled) {
        closeCurrentTab()
    }
}


const cancelAutoClose = () => {
    removeCloseWarningButton()
    isAutoCloseCanceled = true
}

function removeCloseWarningButton () {
    document.getElementById('closeWarningButton').remove()
}

async function insertCloseTabWarningButton (xhrData) {
    const timeToClose = await browser.storage.local.get("timeToClose")
    let replyButton = detectSubmitButton(xhrData.url)
    let warningButtonHtml = `<button type='button' id='closeWarningButton'">Fechando aba em ${timeToClose.timeToClose} segundos, clique para cancelar</button>`
    replyButton.insertAdjacentHTML('beforebegin', warningButtonHtml)
    document.getElementById("closeWarningButton").addEventListener("click", cancelAutoClose);
    startAutoCloseCountdown(parseInt(timeToClose.timeToClose))
}

// END AUTOCLOSETAB


// END SUBSCRIBES


// UTILS

var sleep = function(time){
    return new Promise((resolve) => setTimeout(resolve, time));
}

// END UTILS



// AUTO ANTI-FLOOD =====

var onAntiFlood = false
function startAntiFlood(xhrData, errorMessage){
    if (!antiFloodEnabled){
        return
    }
    if (this.onAntiFlood){
        closeAntiFloodMessage()
        return
    }
    this.onAntiFlood = true
    var replyButton = detectSubmitButton(xhrData.url)
    if (replyButton == null){
        this.onAntiFlood = false
        return
    }
    var antiFloodTime = detectAntiFloodTime(errorMessage)
    closeAntiFloodMessage()
    replyButton.style['pointer-events'] = "none";
    startAntiFloodCountdown(antiFloodTime, replyButton)
}

function detectSubmitButton(currentUrl) {
    var location = currentUrl.split(".com/")[1].split("/")[0];
    var button;
    var allButtons = document.querySelectorAll("button[type=submit]")
    if (location == 'conversations'){
        button = allButtons[4]
    }
    else if(location == 'threads')    {
        button = allButtons[4]
        if (button.classList.contains('button--icon--vote')) {
            button = allButtons[5]
        }
    }
    else{
        return null
    }
    return button
}

function detectAntiFloodTime(errorMessage){
    return parseInt(errorMessage.split('at least ')[1].split(' seconds')[0])
}

function closeAntiFloodMessage(){
    try{
        var blocks = document.getElementsByClassName('overlay-titleCloser')
        for(var i = 0, len = blocks.length; i < len; i++) {   
            try{
                blocks[i].click();
            }
            catch{}
        }
    }
    catch (e){
        console.log("Error on closeAntiFloodMessage: ", e)
    }   
}

var startAntiFloodCountdown = async function(time, replyButton){
    var originalButtonText = replyButton.innerHTML
    replyButton.innerHTML = time
    while (time > 0){
        await sleep(1000).then(() => {
            time--
            replyButton.innerHTML = time
            replyButton.style['pointer-events'] = "none"; 
        })
    }
    replyButton.style['pointer-events'] = "auto";
    replyButton.innerHTML = originalButtonText
    this.onAntiFlood = false
    replyButton.click()
}



// END AUTO ANTI-FLOOD =====



subscribeToXhrListener()
injectScripts()



