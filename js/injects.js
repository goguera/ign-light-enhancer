function sendToContent(obj) {
    window.dispatchEvent(new CustomEvent("getXhrData", {detail: {
        data : obj
    }}));
}

