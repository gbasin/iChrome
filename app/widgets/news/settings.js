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

			var topic = this.model.getTopic(config);
			this.model.set({
				config: config,
				state: "default",
				activeTab: topic
			});
		},


		initialize: function() {
			this.listenTo(this.model, "change:config change:data", _.ary(this.render, 0));

			this.render();
		},


		onBeforeRender: function(config) {
			config.topics = this.model.data.topics;
			config.bbctopics = this.model.bbctopics;

			return config;
		},


		onRender: function(config) {
			var topic = this.$(".topic").val(config.topic),
				edition = this.$(".edition").val(config.edition),
				source = this.$(".source").val(config.source);

			source.on("change", function() {
				var form = this.$("form");
				form.removeClass("msn");
				form.removeClass("bbc");
				form.addClass(source.val());
			}.bind(this));

			edition.on("change", function() {
				if (edition.val() !== config.edition) {
					this.model.getTopics(function(topics) {
						var currTopic = topic.val();

						var hEscape = function(str) {
							str = String(str || "");

							if (/[&<>\{\"\']/.test(str)) {
								return str
									.replace(/&/g, "&amp;")
									.replace(/</g, "&lt;")
									.replace(/>/g, "&gt;")
									.replace(/\'/g, "&#39;")
									.replace(/\"/g, "&quot;")
									.replace(/\{/g, "&#123;");
							}
							else {
								return str;
							}
						};

						topic.html(_.map(topics, function(e) {
							return '<option value="' + hEscape(e[0]) + '"' + (e[0] === currTopic ? " selected" : "") + '>' + hEscape(e[1]) + '</option>';
						}).join(""));
					}, source.var(), edition.val());
				}
			}.bind(this));
		}
	});
});