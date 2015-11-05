define(["lodash", "moment", "widgets/views/main"], function(_, moment, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .tabs button": "scrollTabs",

			"click .tabs li[data-id]": function(e) {
				var tab = e.currentTarget.getAttribute("data-id");

				// If the tab hasn't changed the model won't refresh on its own
				if (tab === this.model.get("activeTab")) {
					this.model.refresh();
				}

				this.model.set("activeTab", tab);

				this.render({
					loading: true
				});
			}
		},

		scrollTabs: function(e) {
			var direction = e.currentTarget.getAttribute("data-direction");

			var tabs = this.$("ul.tabs"),
				finalLeft = tabs[0].scrollLeft,
				offsetWidth = tabs[0].offsetWidth;


			// Scroll by the element width, minus what the buttons cover with padding
			if (direction === "left") {
				finalLeft -= offsetWidth - 85;

				// This stops the tabs from scrolling to just before when the buttons
				// would be hidden
				if (finalLeft < 45) {
					finalLeft = 0;
				}
			}
			else if (direction === "right") {
				finalLeft += offsetWidth - 85;

				if (finalLeft + offsetWidth + 85 > tabs[0].scrollWidth) {
					finalLeft = tabs[0].scrollWidth - offsetWidth;
				}
			}


			tabs.animate({
				scrollLeft: finalLeft
			}, 300);

			// Update the state of the navigation buttons immediately
			// so they can transparently animate out of view while we're scrolling
			this.updateTabs(finalLeft);
		},

		initialize: function() {
			this.listenTo(this.model, "change:config change:size change:data", _.ary(this.render, 0));

			this.listenTo(this.model, "entries:loaded", _.ary(this.render, 1));

			this.render();
		},


		/**
		 * Shows or hides the scroll buttons in the tabs list
		 *
		 * @param  {Number}  [scrollLeft]    A current or near-future scrollLeft position
		 */
		updateTabs: function(scrollLeft) {
			var tabs = this.$("ul.tabs");

			if (!tabs.length) return;

			var scrollWidth = tabs[0].scrollWidth,
				offsetWidth = tabs[0].offsetWidth;

			scrollLeft = typeof scrollLeft === "number" ? scrollLeft : tabs[0].scrollLeft;

			if (scrollWidth - offsetWidth > 15) {
				tabs.toggleClass("scrollable-left", scrollLeft > 0);

				tabs.toggleClass("scrollable-right", scrollLeft + offsetWidth < scrollWidth - 10);
			}

			// Set a transition now so later changes in position transition the
			// buttons in
			setTimeout(function() {
				tabs.css("transition", "margin .15s ease");
			}, 0);
		},


		onBeforeRender: function(data, demo) {
			if (!data.loading) {
				data.items = _.map(data.items, function(e) {
					e = _.clone(e);

					e.date = moment(e.date).fromNow();

					return e;
				});
			}

			if (this.model.config.title) {
				data.title = this.model.config.title;
			}


			if (this.Pro.isPro && this.model.data.topics) {
				var activeTab = this.model.get("activeTab");

				var defaultTab = [];

				var tabs = _.compact(_.map(this.model.data.topics, function(e, i) {
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
		},

		onRender: function(data) {
			if (this.tabsLeft && this.$("ul.tabs").length) {
				this.updateTabs(this.tabsLeft);

				this.$("ul.tabs")[0].scrollLeft = this.tabsLeft;

				delete this.tabsLeft;
			}
			else {
				this.updateTabs();
			}


			if (data.images) {
				this.$("img").on("error", function(e) {
					this.style.height = "20px";
				});
			}
		}
	});
});