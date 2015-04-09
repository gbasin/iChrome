/**
 * This loads the widgets and a getAll function for them
 */
define([
	"lodash", "widgets/utils",
	// These have to be w/ so r.js inlines them
	"w/analytics",	"w/apps",			"w/bookmarks",
	"w/calc",		"w/calendar",		"w/clock",
	"w/currency",	"w/drive",			"w/facebook",
	"w/feedly",		"w/gmail",			"w/iframe",
	"w/keep",		"w/news",			"w/notes",
	"w/now",		"w/plus",			"w/reddit",
	"w/rss",		"w/sports",			"w/stocks",
	"w/todo",		"w/topsites",		"w/traffic",
	"w/translate",	"w/twitter",		"w/unread",
	"w/voice",		"w/weather",		"w/wolfram",
	"w/youtube",	"w/recentlyclosed",	"w/chrome_bookmarks",
	"w/tasks",		"w/quotes",			"w/html",
	"w/notifications",

	"lib/jquery.numberformatter", "lib/jquery.sortable"
], function(_, Utils) {
	var args = Array.prototype.slice.call(arguments, 2),
		widgets = {};

	var resolve = function(widget, string) {
		return Utils.prototype.resolve.call({ widget: widget }, string);
	};

	_.each(args, function(widget, i) {
		if (widget && widget.id && widget.nicename) {
			// This resolves i18n calls in widget configs, it's done here because it's
			// more efficient than doing it on every new Widget() call
			widget.config = _.mapValues(widget.config, function(e) {
				if (typeof e == "string") {
					return resolve(widget, e);
				}
				else {
					return e;
				}
			});

			widgets[widget.id] = widgets[widget.nicename] = widget;
		}
	});

	return widgets;
});