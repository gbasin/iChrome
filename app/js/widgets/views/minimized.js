define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		getTemplate: function() {
			return this.widget.templates.minimized;
		}
	});
});