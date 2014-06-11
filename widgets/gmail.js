/*
 * The Gmail widget.
 */
define(["jquery"], function($) {
	return {
		id: 25,
		nicename: "gmail",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the \"authuser=\" value.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"authuser\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"authuser=\" value"
			},
			{
				type: "number",
				label: "Widget Height",
				nicename: "height",
				min: 100,
				max: 800
			}
		],
		config: {
			user: "0",
			height: 400,
			size: "variable"
		},
		render: function() {
			this.utils.render({
				user: this.config.user || 0,
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	};
});