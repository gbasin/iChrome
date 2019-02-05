/**
 * This loads all defined templates and returns them. This will be replaced with a precompiled JSON set of templates during build.
 */

var templates = [
		"css",					"toolbar",				"search",
		"store",				"store-detail",			"themes",
		"themes.listing",		"themes.custom",		"widget-settings",
		"alert",				"menu",					"widget-settings.inputs",
		"whatsnew",				"bginfo",				"updated",
		"widgets/auth-required","widgets/error",		"widgets/permissions-request",

		"onboarding/modal",		"onboarding/widgets",	"onboarding/settings", "onboarding/modalpro",

		"settings",				"settings/accounts",	"settings/advanced",
		"settings/misc",		"settings/tabs",		"settings/toolbar",
		"settings/visual",		"settings/widgets",		"settings/pro",
		"settings/debug",		"settings/ads",

		"widgets.clock",				"widgets.clock.desc",
		"widgets.calendar",				"widgets.calendar.desc",
		"widgets.apps",					"widgets.apps.desc",
		"widgets.notes",				"widgets.notes.desc",
		"widgets.wolfram",				"widgets.wolfram.desc",
		"widgets.tasks",				"widgets.tasks.desc",				"widgets.tasks.item",
		"widgets.bookmarks",			"widgets.bookmarks.desc",			"widgets.bookmarks.listing",
		"widgets.chrome_bookmarks",		"widgets.chrome_bookmarks.desc",	"widgets.chrome_bookmarks.listing",
		"widgets.reddit",				"widgets.reddit.desc",
		"widgets.feedly",				"widgets.feedly.desc",				"widgets.feedly.articles",
		"widgets.now",					"widgets.now.desc",
		"widgets.twitter",				"widgets.twitter.desc",
		"widgets.calc",					"widgets.calc.desc",
		"widgets.youtube",				"widgets.youtube.desc",
		"widgets.plus",					"widgets.plus.desc",
		"widgets.facebook",				"widgets.facebook.desc",
		"widgets.quotes",				"widgets.quotes.desc",
		"widgets.html",					"widgets.html.desc",
		"widgets.notifications",		"widgets.notifications.desc",
		"widgets.sitelink",				"widgets.sitelink.desc",
		"widgets.stats",				"widgets.stats.desc",
		"widgets.search",				"widgets.search.desc",
		"widgets.pushbullet",			"widgets.pushbullet.desc",
		"widgets.linkedin",				"widgets.linkedin.desc",
		"widgets.directions",			"widgets.directions.desc",
		"widgets.pocket",				"widgets.pocket.desc"
	],
	deps = [];

templates.forEach(function(e, i) {
	deps[i] = "text!/templates/";

	if (/^widgets\.([a-z\-_]*)\.(.*)$/.test(e)) {
		deps[i] += e.replace(/^widgets\.([a-z\-_]*)\.(.*)$/, "widgets/$1/$2");
	}
	else if (e.indexOf("widgets.") === 0) {
		deps[i] += e.replace(/^widgets\.([a-z\-_]*)$/, "widgets/$1/template");
	}
	else {
		deps[i] += e;
	}

	deps[i] += ".hjs";
});

/*
	During build this whole file will be replaced with a static version of precompiled templates
*/
define(deps, function() {
	var raw = {};

	[].forEach.call(arguments, function(e, i) {
		raw[templates[i]] = e;
	});

	return {
		raw: raw,
		compiled: null
	};
});