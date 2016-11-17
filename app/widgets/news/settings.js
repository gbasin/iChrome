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

			// Trigger a topic reload
			this.model.topicsLoaded = false;

			this.model.set({
				config: config,
				state: "default",
				activeTab: config.topic
			});
		},


		initialize: function() {
			this.listenTo(this.model, "change:config change:data", _.ary(this.render, 0));

			this.render();
		},


		onBeforeRender: function(config) {
			config.topics = this.model.data.topics;

			return config;
		},

		onRender: function(config) {
			this.$(".topic").val(config.topic);
		}
	});
});