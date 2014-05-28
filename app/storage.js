var initLog = [[new Date().getTime(), "Starting storage fetching"]];

chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
	window.iChromeConfig = d;

	if (iChrome && iChrome.Status && iChrome.Status.log) {
		iChrome.Status.log("Storage fetched, processing...");
	}
	else {
		initLog.push([new Date().getTime(), "Storage fetched, processing"]);
	}
	
	if (window.processStorage) {
		window.processStorage();
	}
});