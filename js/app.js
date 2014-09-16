/**
 * Configure requireJS.
 */
require.config({
	baseUrl: "js",
	paths: {
		"w": "../widgets",
		"text": "lib/text",
		"hogan": "lib/hogan",
		"lodash": "lib/lodash",
		"moment": "lib/moment",
		"jquery": "lib/jquery",
		"oauth2": "../oauth2/oauth2",
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
		"lib/jquery.spectrum": ["jquery"],
		"lib/jquery.numberformatter": ["jquery", "lib/jshashtable"],

		// This is temporarily in the shim till it's restructured
		"script": ["moment", "widgets", "lib/jquery.spectrum", "lib/jquery.sortable"],
		"widgets": ["lib/jquery.numberformatter", "moment", "hogan", "oauth2"]
	}
});

/**
 * Load, this has to load moment this way because script.js needs to shimmed and moment doesn't define properly unless require'd
 */
require(["moment", "core/templates", "core/status", "storage/storage", "modals/getting-started", "core/init"], function(moment, render, status, storage, guide, app) {
	window.moment = moment;

	window.App = app;

	iChromeStatus = status;
	iChromeRender = render;
	iChromeGuide = guide.show.bind(guide);

	storage.done(function(storage) {
		iChromeStorage = storage;

		require(["script"]);
	});
});