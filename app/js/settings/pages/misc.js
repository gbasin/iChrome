/**
 * The misc settings page
 */
define(["settings/page"], function(Page) {
	var View = Page.extend({
		id: "misc",

		dynamicControls: {
			"ltab": "ltab"
		},

		monitorProps: ["ltab"]
	});

	return View;
});