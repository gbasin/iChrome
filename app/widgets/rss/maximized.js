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


		onBeforeRender: function(data, demo) {
			data.layout = this.layout;

			data.list = this.layout === "list";

			if (!data.loading) {
				// Saved for layout changes
				if (data.items) {
					this.lastItems = data.items;
				}

				data.featured = [];

				var featured = 0;

				data.items = _.compact(_.map(data.items, function(e) {
					e = _.clone(e);

					e.date = moment(e.date).fromNow();

					if (this.model.config.desc === "false") {
						delete e.desc;
					}

					if (this.model.config.images === "false") {
						delete e.image;
					}

					// The first two articles with images are selected as featured
					if (e.image && data.layout === "cards" && featured < 2) {
						featured++;

						data.featured.push(e);

						return null;
					}

					return e;
				}, this));
			}


			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			if (this.model.config.link) {
				data.link = this.model.config.link.parseUrl();
			}

			if (this.model.config.view && this.model.config.view == "images") {
				data.images = true;
			}


			var activeTab = this.model.get("activeTab");

			data.tabs = _.map(this.model.config.feeds, function(e, i) {
				return {
					id: i,
					name: e.name,
					active: i == activeTab
				};
			});

			// Maximized views can show articles from all feeds
			if (data.tabs.length > 1) {
				data.tabs.unshift({
					id: "all",
					active: activeTab === "all",
					name: this.translate("all_articles")
				});
			}


			// Preserve the scrolled state of the tabs
			if (this.$("ul.tabs").length) {
				this.tabsLeft = this.$("ul.tabs")[0].scrollLeft;
			}


			return data;
		}
	});
});