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

		resizeImage: function(featured, e) {
			if (!e || !e.image) {
				return;
			}

			// The 18px is 10px padding + an 8px scrollbar
			var containerWidth = window.innerWidth - 18;

			var width;
			if (featured === 1) {
				// Bing identifies the subject in images, resizing them to focus appropriately
				//
				// We calculate the final size at 2x and request a scaled image
				//
				// The calculation here is a 60% flex-basis + a flex-grow of 3 (takes 0.75 of
				// available space) times the remaining 10% of the container width (after the
				// two flex-basis's) minus 20px combined margin from both featured articles
				width = Math.round(((0.6 * containerWidth) + (0.75 * ((0.1 * containerWidth) - 20))) * 2);
			}
			else if (featured === 2) {
				// Same thing here, just with a flex-grow of 1 and 30% basis
				width = Math.round(((0.3 * containerWidth) + (0.25 * ((0.1 * containerWidth) - 20))) * 2);
			}
			else {
				width = Math.round(((containerWidth / 5) - 10) * 2);
			}

			if (this.model.isBbc()) {
				if (width > 2048) {
					width = 2048;
				} else if (width > 1024) {
					width = 1024;
				} else if (width > 999) {
					width = 999;
				}

				e.image = e.image.replace("/320/", "/" + width + "/");

				return;
			}
			
			if (featured === 1) {
				// Bing identifies the subject in images, resizing them to focus appropriately
				//
				// We calculate the final size at 2x and request a scaled image
				//
				// The calculation here is a 60% flex-basis + a flex-grow of 3 (takes 0.75 of
				// available space) times the remaining 10% of the container width (after the
				// two flex-basis's) minus 20px combined margin from both featured articles
				e.image = e.image.replace(".img", "_m5_w" + width + "_h800");
			}
			else if (featured === 2) {
				// Same thing here, just with a flex-grow of 1 and 30% basis
				e.image = e.image.replace(".img", "_m5_w" + width + "_h800");
			}
			else {
				e.image = e.image.replace(".img", "_m5_w" + width + "_h350");
			}
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

				var featured = data.layout === "cards" ? 0 : 999999;

				data.items = _.compact(_.map(data.items, function(e) {
					e = _.clone(e);

					e.date = moment(e.date).fromNow();

					++featured;
					// The first two articles with images are selected as featured
					if (featured < 3) {
						this.resizeImage(featured, e);
						data.featured.push(e);

						return null;
					}

					this.resizeImage(featured, e);
					return e;
				}, this));
			}


			if (this.model.config.title) {
				data.title = this.model.config.title;
				if (this.model.isBbc()) {
					if (data.title !== "BBC News") {
						data.title += ", BBC News";
					}
				}
			}

			var topics = this.model.getStoredTopics();
			var topic = this.model.getTopic();
			if (topics) {
				var activeTab = this.model.get("activeTab");

				var defaultTab = [];

				var tabs = _.compact(_.map(topics, function(e) {
					e = {
						id: e[0],
						name: e[1],
						active: e[0] === activeTab
					};

					if (e.id === topic) {
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