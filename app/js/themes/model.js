define(["lodash", "backbone", "browser/api", "themes/utils", "i18n/i18n"], function(_, Backbone, Browser, Utils, Translate) {
	var model = Backbone.Model.extend({
		url: "https://api.ichro.me/themes/v1/list?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language,

		defaults: {
			index: [],
			themes: [],
			custom: [],
			categories: []
		},

		initialize: function() {
			Utils.model.on("change:cached", function() {
				this.parse(this.manifest);
			}, this);

			Utils.model.on("change:custom", this.updateCustom, this);

			this.updateCustom();
		},


		/**
		 * Parses the custom themes from the Utils model and stores them locally
		 *
		 * @api    private
		 */
		updateCustom: function() {
			var custom = JSON.parse(JSON.stringify(Utils.model.get("custom") || []));

			custom = custom.map(function(e, i) {
				var theme = _.defaults(e, Utils.defaults);

				theme.id = i;

				theme.custom = true;

				theme.thumb = theme.image;

				return theme;
			});

			this.set("custom", custom);

			this.trigger("change");
		},

		parse: function(d) {
			// This caches the manifest so newly cached themes only involve a reparse
			if (!this.manifest) {
				this.manifest = JSON.parse(JSON.stringify(d));
			}

			var index = {},
				themes = [],
				categories = [];

			var cached = Utils.model.get("cached"),
				types = {
					random: {
						icon: "&#xE69C;",
						desc: Translate("themes.random")
					},
					random_daily: {
						icon: "&#xE63F;",
						desc: Translate("themes.random_daily")
					},
					sunrise_sunset: {
						icon: "&#xE63D;",
						desc: Translate("themes.sunrise_sunset")
					},
					feed: {
						icon: "&#xE66A;",
						desc: Translate("themes.feed")
					},
					video: {
						icon: "&#xE69D;",
						desc: Translate("themes.video")
					}
				};


			d.themes.forEach(function(e) {
				var theme = _.clone(e);

				theme.filterCategories = e.categories;
				theme.offline = !!cached[e.id];
				theme.thumb = theme.thumb || "https://themes.ichro.me/thumbnails/" + e.id + ".png";

				if (e.resolution) {
					theme.resolution = e.resolution[0] + "x" + e.resolution[1];
				}

				if (e.images || e.size) {
					theme.stats = "";

					if (e.images) {
						theme.stats += Translate("themes.images", e.images.length) + (e.size ? ", " : "");
					}

					if (e.size) {
						theme.stats += e.size;
					}
				}

				if (e.type && e.type === "video") {
					theme.proOnly = true;
				}

				if (e.type && types[e.type]) {
					theme.type = types[e.type];

					theme.oType = e.type;
				}

				if (e.source) {
					theme.source = e.source;
				}

				if (e.name) {
					theme.name = e.name;
				}


				var categories = [];

				e.categories.forEach(function(e) {
					if (d.categories[e]) {
						categories.push(d.categories[e]);
					}
				});

				theme.categories = categories.join(", ");


				index[e.id] = themes.length;

				themes.push(theme);
			});


			_.each(d.categories, function(e, i) {
				categories.push({
					name: e,
					id: parseInt(i)
				});
			});


			return {
				index: index,
				themes: themes,
				categories: categories.sort(function(a, b) { return a - b; })
			};
		}
	});

	return model;
});