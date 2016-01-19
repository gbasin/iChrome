define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		getTemplate: function() {
			return this.widget.templates.settings;
		},

		render: function(data, partials) {
			return WidgetView.prototype.render.call(this, data || this.model.config, partials);
		}
	});
});