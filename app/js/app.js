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
		"oauth2": "../oauth2/oauth2",
		"widgetTemplate": "widgets/registry/template",
		"jquery.serializejson": "lib/jquery.serializejson",
		"backbone.documentmodel": "lib/backbone.documentmodel",
		"backbone.viewcollection": "lib/backbone.viewcollection"
	},
	map: {
		"*": {
			"underscore": "lodash", // a Lodash Underscore build is not required for Backbone
			"backbone": "backbone.documentmodel" // DocumentModel returns Backbone, therefore it's a variation of backbone and "not" an extension
		},
		"backbone.documentmodel": {
			"backbone": "lib/backbone" // But it itself requires Backbone
		}
	},
	shim: {
		"lib/jquery.sortable": ["jquery"],
		"lib/jquery.numberformatter": ["jquery", "lib/jshashtable"]
	}
});


// Make require synchronous. We do this to avoid delays with the two-tiered
// widget system (load the manifest, then the actual code). Without it calls to
// require wait at least 4ms before resolving, even if the module has been
// registered (but not initialized). The difference is difficult to measure but
// this saves approximately 200ms until the first full widget paint.
require.s.contexts._.nextTick = function(fn) {
	return fn();
};


/**
 * Init.  This requires storage to start loading as early as possible.
 */
require(["core/render", "storage/storage", "modals/getting-started", "core/init"], function(render, storage, guide, app) {
	window.App = app;
});