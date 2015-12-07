define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		onBeforeRender: function(data) {
			data.user = this.model.config.user || 0;
			data.inbox = this.model.config.open === "inbox";

			if (data.count === 0) {
				data.label = this.translate("unread_none");
			}
			else if (data.count === 1) {
				data.label = this.translate("unread_one");
			}
			else {
				data.label = this.translate("unread_many");
			}

			data.count = data.count.toLocaleString();

			return data;
		}
	});
});