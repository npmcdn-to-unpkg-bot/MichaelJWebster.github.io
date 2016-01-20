// Could use importScripts here.
onmessage = function(e) {
    var result = eval(e.data);
    postMessage(result);
};

//postMessage("Web Worker Attached.");
