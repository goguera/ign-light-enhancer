
function isNormalInteger(str) {
  if (str === undefined) return false
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}


function saveOptions(e) {
  e.preventDefault();
  timeToCloseInput = document.getElementById('timelimit')
  if (!isNormalInteger(timeToCloseInput.value)) {
    alert ("Precisa ser um número inteiro e positivo, animal")
    return
  }
  browser.storage.local.set({
    closeTabOnPost: document.getElementById('yes').checked === true ? 'yes' : 'no',
    timeToClose: timeToCloseInput.value || 10 
  }).then(() => window.close())
}

function restoreOptions() {

  function setCurrentChoice(result) {
    let timeToCloseInput = document.getElementById('timelimit')
    if (Object.keys(result).length === 0) {
      document.getElementById('no').checked = true;
      timeToCloseInput.value = 10
    }
    else {
      document.getElementById(result.closeTabOnPost).checked = true;
      timeToCloseInput.value = result.timeToClose
    }
  }

  function onError(error) {
    setCurrentChoice({closeTabOnPost: 'yes', timeToClose: 55})
  }
  

  browser.storage.local.get(["closeTabOnPost", "timeToClose"]).then(setCurrentChoice, onError);

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
