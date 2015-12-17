/**
 * The misc settings page
 */
define(["settings/page"], function(Page) {
	var View = Page.extend({
		id: "misc",

		dynamicControls: {
			"openLinksInNewTab": "openLinksInNewTab"
		},

		monitorProps: ["openLinksInNewTab"]
	});

	return View;
});