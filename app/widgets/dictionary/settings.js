define(["lodash", "jquery", "widgets/views/settings", "jquery.serializejson"], function(_, $, WidgetView) {
	return WidgetView.extend({
		events: {
			"click header button.save": "serialize",

			"keydown label.input > input": function(e) {
				if (e.which === 13) {
					this.serialize();
				}
			}
		},


		/**
		 * Serializes and saves the contents of the settings form
		 */
		serialize: function() {
			var config = _.assign({}, this.model.config, this.$("form").serializeJSON());
			this.model.set({
				config: config,
				state: "default"
			});
		},


		initialize: function() {
			this.render();
		},

		onBeforeRender: function(config) {
			return config;
		},

		onRender: function(config) {
			this.$(".lang").val(config.lang);
		}
	});
});