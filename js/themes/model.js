define(["lodash", "backbone", "themes/utils"], function(_, Backbone, Utils) {
	var model = Backbone.Model.extend({
		url: "http://themes.ichro.me/manifest.json",

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
						entypo: "entypo",
						desc: "This theme displays a random image every time you load the page"
					},
					random_daily: {
						icon: "&#xF073;",
						desc: "This theme displays a randomly picked image every day"
					},
					sunrise_sunset: {
						icon: "&#xE63D;",
						entypo: "entypo",
						desc: "This theme displays an image based on the time of day"
					},
					feed: {
						icon: "&#xF09E;",
						desc: "This theme displays an image selected daily from an external feed"
					}
				};

			
			d.themes.forEach(function(e, i) {
				var theme = _.clone(e);

				theme.filterCategories = e.categories;
				theme.offline = !!cached[e.id];
				theme.thumb = theme.thumb || "http://themes.ichro.me/thumbnails/" + e.id + ".png";

				if (e.resolution) {
					theme.resolution = e.resolution[0] + "x" + e.resolution[1];
				}

				if (e.images || e.size) {
					theme.stats = "";

					if (e.images) {
						theme.stats += e.images.length + " images" + (e.size ? ", " : "");
					}

					if (e.size) {
						theme.stats += e.size;
					}
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

				e.categories.forEach(function(e, i) {
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