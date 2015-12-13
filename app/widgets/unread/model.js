define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 120000,

		defaults: {
			config: {
				user: "0",
				open: "gmail"
			},
			data: {
				count: 1,
				messages: [
					{
						subject: "This is a sample message subject",
						excerpt: "And this is some sample message content!!"
					}
				]
			}
		},

		refresh: function() {
			$.get("https://mail.google.com/mail/u/" + (this.config.user || 0) + "/feed/atom/", function(d) {
				try {
					d = $(d);

					this.saveData({
						count: parseInt(d.find("fullcount").text()) || 0,
						messages: _.map(d.find("entry").toArray().slice(0, 4), function(e) {
							return {
								subject: e.querySelector("title").textContent,
								excerpt: e.querySelector("summary").textContent
							};
						})
					});
				}
				catch (e) {
					this.saveData({
						count: 0,
						messages: []
					});
				}
			}.bind(this)).fail(function() {
				this.saveData({
					count: 0,
					messages: []
				});
			}.bind(this));
		}
	});
});