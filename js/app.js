/**
 * Configure requireJS.
 */
require.config({
	baseUrl: "/js",
	paths: {
		"text": "lib/text",
		"hogan": "lib/hogan",
		"moment": "lib/moment",
		"jquery": "lib/jquery",
		"oauth2": "/oauth2/oauth2"
	},
	shim: {
		"lib/jquery.sortable": ["jquery"],
		"lib/jquery.spectrum": ["jquery"],
		"lib/jquery.numberformatter": ["jquery", "lib/jshashtable"],

		// This is temporarily in the shim till it's restructured
		"script": ["moment", "storage", "widgets", "lib/jquery.spectrum", "lib/jquery.sortable"],
		"widgets": ["lib/jquery.numberformatter", "moment", "hogan", "oauth2"]
	}
});

/**
 * Load, this has to load moment this way because script.js needs to shimmed and moment doesn't define properly unless require'd
 */
require(["moment", "core/templates", "core/status", "lib/extends"], function(moment, render, status) {
	window.moment = moment;

	iChromeStatus = status;
	iChromeRender = render;

	require(["script"]);
});