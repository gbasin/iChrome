/**
 * This creates an onHeadersReceived listener on an as-needed basis.
 */
define(function() {
	var listening = false;

	var check = function(cb, ctx, args) {
		if (listening) return true;
		
		chrome.tabs.getCurrent(function(tab) {
			chrome.webRequest.onHeadersReceived.addListener(
				function(info) {
					var headers = info.responseHeaders || [];

					for (var i = headers.length - 1; i >= 0; --i) {
						var header = headers[i].name.toLowerCase();

						if (header == "x-frame-options" || header == "frame-options") {
							headers.splice(i, 1);
						}
					}

					return {
						responseHeaders: headers
					};
				},
				{
					tabId: tab.id,
					urls: [ "*://*/*" ],
					types: [ "sub_frame" ]
				},
				["blocking", "responseHeaders"]
			);

			listening = true;

			cb.apply(ctx, args);
		});

		return false;
	};

	return check;
});