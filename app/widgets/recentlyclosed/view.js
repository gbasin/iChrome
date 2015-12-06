define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .item": function(e) {
				e.preventDefault();

				Browser.sessions.restore(e.currentTarget.getAttribute("data-id"), function(session) {
					if (this.model.config.target == "_self") {
						Browser.tabs.getCurrent(function(tab) {
							if (tab) Browser.tabs.remove(tab.id);
						});
					}
				}.bind(this));
			}
		},

		onBeforeRender: function(data) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}
		}
	});
});