/**
 * Configure requireJS.
 */
require.config({
	baseUrl: "/js",
	paths: {
		"app": "/app",
		"oauth2": "/oauth2/oauth2"
	},
	shim: {
		"jquery.sortable": ["jquery"],
		"jquery.numberformatter": ["jquery", "jshashtable"],
		"jquery.spectrum": ["jquery"],
		"extends": ["jquery"],

		// This is temporarily in the shim till it's restructured
		"app/script": ["moment", "app/storage", "app/widgets", "jquery.spectrum", "jquery.sortable"],
		"app/widgets": ["jquery.numberformatter", "moment", "hogan", "oauth2"]
	}
});

/**
 * Load, this has to load moment this way because script.js needs to shimmed and moment doesn't define properly unless require'd
 */
require(["moment", "extends"], function(moment) {
	window.moment = moment;

	require(["app/script"]);
});