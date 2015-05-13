/**
 * This creates an onHeadersReceived listener on an as-needed basis.
 */
define(["jquery"], function($) {
	var listening = false,
		attaching = false,
		callbacks = [];

	var check = function(cb, ctx, args) {
		if (listening) return true;

		callbacks.push(function() {
			cb.apply(ctx, args);
		});

		if (attaching) return false;

		attaching = true;

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
			attaching = false;

			callbacks.forEach(function(cb) {
				cb();
			});

			callbacks = [];
		});

		return false;
	};

	return check;
});