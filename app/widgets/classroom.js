/*
 * The Classroom widget.
 */
define(["jquery", "widgets/framefix"], function($, frameFix) {
	return {
		id: 41,
		size: 4,
		nicename: "classroom",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "i18n.settings.account",
				help: "i18n.settings.account_help",
				placeholder: "i18n.settings.account_placeholder"
			},
			{
				type: "select",
				label: "i18n.settings.mode",
				nicename: "mode",
				options: {
					"teacher": "i18n.settings.mode_teacher",
					"student": "i18n.settings.mode_student"
				}
			}
		],
		config: {
			user: "0",
			mode: "student",
			size: "variable"
		},
		render: function() {
			if (!frameFix(this.render, this, arguments)) return;

			this.utils.render({
				url: "https://classroom.google.com/u/" + (this.config.user || 0) + (this.config.mode === "teacher" ? "/ta/not-reviewed/all" : "/a/not-turned-in/all")
			});

			this.elm.addClass("tabbed");
		}
	};
});