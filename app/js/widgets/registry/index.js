/**
 * This module is required by the registry and handles widget loading before
 * registration.
 * 
 * All new widgets need to be added to this file, or they won't be available
 * through the registry.
 *
 * The paths to these widgets are dynamically generated, so r.js can't inline
 * them automatically. Instead, they're manually included in the built file.
 */
var widgets = [
	"drive"
].map(function(e) {
	return "json!w/" + e + "/manifest.json";
});

var legacyWidgets = [
	"analytics",		"apps",				"bookmarks",
	"calc",				"calendar",			"clock",
	"currency",			"facebook",			"feedly",
	"gmail",			"iframe",			"keep",
	"news",				"notes",			"now",
	"plus",				"reddit",			"rss",
	"sports",			"stocks",			"todo",
	"topsites",			"traffic",			"translate",
	"twitter",			"unread",			"voice",
	"weather",			"wolfram",			"youtube",
	"recentlyclosed",	"chrome_bookmarks",	"tasks",
	"quotes",			"html",				"notifications",
	"sitelink",			"stats",			"search",
	"classroom",		"pushbullet",		"linkedin",
	"directions",		"pocket"
].map(function(e) {
	return "w/" + e;
});


// We need to use a named module because the requirejs compiler can't inline an
// anonymous module with dynamic dependencies properly
define(widgets.concat(legacyWidgets, [
	// These are used by various legacy widgets
	"lib/jquery.numberformatter", "lib/jquery.sortable"
]), function() {
	return {
		legacy: [].slice.call(arguments, widgets.length, -2),
		widgets: [].slice.call(arguments, 0, widgets.length)
	};
});