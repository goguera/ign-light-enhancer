function handleMessage(request, sender, sendResponse) {
  if (request.command === 'closeCurrentTab') {
    browser.tabs.remove(sender.tab.id);   
  }
}

browser.runtime.onMessage.addListener(handleMessage);