/**
 * This creates an onHeadersReceived listener on an as-needed basis.
 */
define(["jquery", "browser/api"], function($, Browser) {
	var tabId = null,
		listening = false,
		attaching = false,
		callbacks = [];

	var check = function(cb, ctx, args) {
		if (listening) {
			return true;
		}

		callbacks.push(function() {
			cb.apply(ctx, args);
		});

		if (attaching) {
			return false;
		}

		attaching = true;

		Browser.tabs.getCurrent(function(tab) {
			tabId = tab.id;

			Browser.webRequest.onHeadersReceived.addListener(
				function(info) {
					var headers = info.responseHeaders || [];

					for (var i = headers.length - 1; i >= 0; --i) {
						var header = headers[i].name.toLowerCase();

						if (header === "x-frame-options" || header === "frame-options") {
							headers.splice(i, 1);
						}
						else if (header === "content-security-policy") {
							// Remove any frame-ancestors CSP directives, this is actually spec-compliant
							headers[i].value = headers[i].value.split(";").filter(function(e) {
								return e.trim().toLowerCase().indexOf("frame-ancestors") !== 0;
							}).join(";");
						}
					}

					return {
						responseHeaders: headers
					};
				},
				{
					tabId: tabId,
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

	check.getTabId = function() {
		return tabId;
	};

	return check;
});