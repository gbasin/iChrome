/**
 * Configure requireJS.
 */
require.config({
	baseUrl: "js",
	paths: {
		"w": "../widgets",
		"text": "lib/text",
		"json": "lib/json",
		"hogan": "lib/hogan",
		"oauth": "lib/oauth",
		"lodash": "lib/lodash",
		"moment": "lib/moment",
		"jquery": "lib/jquery",
		"backbone": "lib/backbone",
		"oauth2": "../oauth2/oauth2",
		"fbanalytics": "lib/fbanalytics",
		"widgetTemplate": "widgets/registry/template",
		"jquery.serializejson": "lib/jquery.serializejson",
		"facebooksdk": "https://connect.facebook.net/en_US/sdk",
		"backbone.viewcollection": "lib/backbone.viewcollection"
	},
	map: {
		"*": {
			"underscore": "lodash" // a Lodash Underscore build is not required for Backbone
		}
	},
	shim: {
		"lib/jquery.sortable": ["jquery"],
		"facebooksdk": {
			exports: "FB"
		}
	}
});


// Make require synchronous. We do this to avoid delays with the two-tiered
// widget system (load the manifest, then the actual code). Without it calls to
// require wait at least 4ms before resolving, even if the module has been
// registered (but not initialized). The difference is difficult to measure but
// this saves approximately 200ms until the first full widget paint.
if (require.s) {
	require.s.contexts._.nextTick = function(fn) {
		return fn();
	};
}


/**
 * Init
 */
require(["core/init", "core/autorun"], function(app) {
	window.App = app;
});