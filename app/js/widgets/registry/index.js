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
	"drive", "rss", "news", "weather", "stocks", "translate", "sports",
	"analytics", "dictionary"
].map(function(e) {
	return "json!w/" + e + "/manifest.json";
});

var legacyWidgets = [
	"apps",				"bookmarks",
	"calc",				"calendar",			"clock",
	"currency",			"facebook",			"feedly",
	"gmail",			"iframe",			"keep",
	"notes",			"now",
	"plus",				"reddit",			"todo",
	"topsites",			"traffic",
	"twitter",			"unread",			"voice",
	"wolfram",			"youtube",
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
	// Sortable is used by various legacy widgets
	"lib/jquery.sortable"
]), function() {
	return {
		legacy: [].slice.call(arguments, widgets.length, -1),
		widgets: [].slice.call(arguments, 0, widgets.length)
	};
});