define(["lodash", "widgets/views/main"], function(_, WidgetView) {
	return WidgetView.extend({
		events: {
			"click header .select .options li": function(e) {
				this.model.set("range", e.currentTarget.getAttribute("data-id"));

				this.render({
					loading: true
				});
			}
		},

		initialize: function(e) {
			WidgetView.prototype.initialize.call(this);

			this.listenTo(this.model, "data:loaded", this.render);
		},

		onBeforeRender: function(data, isPreview) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			if (!this.model.config.profile && !isPreview) {
				data.noProfile = true;
			}


			var activeView = this.model.get("range");

			data.views = _.map({
				today: "Today",
				yesterday: "Yesterday",
				pastweek: "Past Week"
			}, function(e, k) {
				if (k === activeView) {
					data.activeView = e;
				}

				return {
					id: k,
					name: e,
					active: k === activeView
				};
			}, this);

			return data;
		}
	});
});