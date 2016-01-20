define(function(require) {
    var jsRepl = {};

    jsRepl.getRepl = function(parentEl) {
	repl = {};
	repl.debug = false;
	repl.parent = parentEl;
	var prompt = "> ";

	repl.worker = new Worker("http://www.lem.com/js/util/replWorker.js");

	function writePrompt() {
	    if (repl.debug) {
		console.log("Writing prompt text area: string\n");
	    }
	    var r = $(repl.parent);
	    r.val(r.val() + "\n" + prompt);
	}
	
	repl.writeString = function(msg) {
	    if (repl.debug) {
		console.log("Writing to text area: string\n" + msg);
	    }
	    var r = $(repl.parent);
	    r.val(r.val() + "\n" + msg);
	    writePrompt();
	};

	repl.readLastString = function() {
	    if (repl.debug) {
		console.log("Read from textarea: string =\n" + $(repl.parent).val());
	    }	    
	    var stringRead = $(repl.parent).val().split("\n").slice(-1)[0];
	    stringRead = stringRead.replace(/^> /,"");

	    return stringRead;
	};

	repl.sendMessage = function(msg) {
	    if (repl.debug) {
		// Print out a debug message.
		console.log("Sending Message to worker.");
		console.log(msg);
	    }
	    repl.worker.postMessage(msg);
	};

	repl.worker.onmessage = function(e) {
	    if (repl.debug) {
		// Print out a debug message.
		console.log("Received Message from worker.");
		console.log(e.data);
	    }
	    repl.writeString(e.data.toString());
	    repl.messCb && repl.messCb(e);
	};

	repl.worker.onerror = function(e) {
	    if (repl.debug) {
		// Print out a debug message.
		console.log("ERROR at " + e.filename + ":" + e.lineno + ": " +
			    e.message);
	    }
	    repl.errCb && repl.errCb(e);
	};
	    
	repl.setDebug = function(debugOn) {
	    repl.debug = debugOn;
	};

	repl.setMessageCallback = function(cb) {
	    repl.messCb = cb;
	};

	repl.setErrorCallback = function(cb) {
	    repl.errCb = cb;
	};

	repl.sendObject = function(obj) {
	    if (repl.debug) {
		console.log("Posting an object to the worker. Input is:\n");
		console.log(obj);
	    }
	    repl.worker.postMessage(obj);
	};

	$(repl.parent).keypress(function(e) {
	    //console.log(e.which);
	    if (e.which == 13) {
		// User hit enter. Read in the last line and send it to
		// the repl worker.
		var line = repl.readLastString();
		if (repl.debug) {
		    console.log("Posting user input to worker. Input is:\n");
		    console.log(line);
		}
		repl.worker.postMessage(line);
	    }
	});
	
	return repl;
    };
    return jsRepl;
});
