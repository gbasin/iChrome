define(["lodash", "./view", "moment"], function(_, MainView, moment) {
	return MainView.extend({
		events: _.assign({
			"click header button.layout": function(e) {
				if (this.layout === "cards") {
					this.layout = "list";
				}
				else {
					this.layout = "cards";
				}

				e.currentTarget.setAttribute("data-state", this.layout);

				if (this.lastItems) {
					this.render({
						items: this.lastItems
					});
				}
				else {
					this.render({
						loading: true
					});

					this.model.refresh();
				}
			}
		}, MainView.prototype.events),


		/**
		 * Since we extend from the main widget view and not the maximized view,
		 * we need to reset the template
		 */
		getTemplate: function() {
			return this.widget.templates.maximized;
		},


		initialize: function() {
			// We don't listen for config changes since the model will run a fetch
			// when those happen, and we can't render without articles anyway
			this.listenTo(this.model, "entries:loaded", _.ary(this.render, 1));

			this.layout = "cards";

			this.render({
				loading: true
			});
		},


		onBeforeRender: function(data) {
			data.layout = this.layout;

			data.list = this.layout === "list";

			if (!data.loading) {
				// Saved for layout changes
				if (data.items) {
					this.lastItems = data.items;
				}

				data.featured = [];

				var featured = 0;

				// The 18px is 10px padding + an 8px scrollbar
				var containerWidth = window.innerWidth - 18;

				data.items = _.compact(_.map(data.items, function(e) {
					e = _.clone(e);

					e.date = moment(e.date).fromNow();

					// The first two articles with images are selected as featured
					if (e.image && data.layout === "cards" && featured < 2) {
						featured++;

						if (featured === 1) {
							// Bing identifies the subject in images, resizing them to focus appropriately
							//
							// We calculate the final size at 2x and request a scaled image
							//
							// The calculation here is a 60% flex-basis + a flex-grow of 3 (takes 0.75 of
							// available space) times the remaining 10% of the container width (after the
							// two flex-basis's) minus 20px combined margin from both featured articles
							e.image = e.image.replace(".img", "_m5_w" + Math.round(((0.6 * containerWidth) + (0.75 * ((0.1 * containerWidth) - 20))) * 2) + "_h800");
						}
						else {
							// Same thing here, just with a flex-grow of 1 and 30% basis
							e.image = e.image.replace(".img", "_m5_w" + Math.round(((0.3 * containerWidth) + (0.25 * ((0.1 * containerWidth) - 20))) * 2) + "_h800");
						}

						data.featured.push(e);

						return null;
					}

					if (e.image) {
						e.image = e.image.replace(".img", "_m5_w" + Math.round(((containerWidth / 5) - 10) * 2) + "_h350");
					}

					return e;
				}, this));
			}


			if (this.model.config.title) {
				data.title = this.model.config.title;
			}


			if (this.model.data.topics) {
				var activeTab = this.model.get("activeTab");

				var defaultTab = [];

				var tabs = _.compact(_.map(this.model.data.topics, function(e) {
					e = {
						id: e[0],
						name: e[1],
						active: e[0] === activeTab
					};

					if (e.id === this.model.config.topic) {
						defaultTab = [e];

						return;
					}

					return e;
				}, this));

				data.tabs = defaultTab.concat(tabs);
			}

			// Preserve the scrolled state of the tabs
			if (this.$("ul.tabs").length) {
				this.tabsLeft = this.$("ul.tabs")[0].scrollLeft;
			}

			return data;
		}
	});
});