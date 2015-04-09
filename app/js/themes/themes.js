/**
 * The themes modal
 */
define(
	["lodash", "jquery", "backbone", "core/analytics", "modals/modals", "themes/model", "themes/utils", "themes/custom", "themes/cacher", "i18n/i18n", "core/render"],
	function(_, $, Backbone, Track, Modal, Model, Utils, Custom, Cacher, Translate, render) {
		var modal = new (Modal.extend({
			classes: "themes",
		}))();

		var View = Backbone.View.extend({
			el: modal.content,


			/**
			 * This holds an array of theme images so the scroll handler doesn't
			 * have to query for them while handling lazy-loading.
			 *
			 * @type {Element[]}
			 */
			images: [],


			events: {
				"click .btn.use": "use",
				"click .btn.edit": "edit",
				"click .btn.delete": "delete",
				"click .btn.preview": "preview",
				"click .nav li[data-id]": "filter",
				"click .nav li.create .btn": "createTheme"
			},


			/**
			 * Creates a new custom theme
			 *
			 * @api    private
			 * @param  {Event} e The event
			 */
			createTheme: function(e) {
				this.createModal = new Custom();

				this.createModal.on("save", function() {
					this.model.updateCustom();
				}, this).on("preview", function(theme) {
					this.trigger("preview", theme);
				}, this);

				Track.pageview("Themes: Create", "/themes/create");
			},


			/**
			 * Edits a custom theme
			 *
			 * @api    private
			 * @param  {Event} e The event
			 */
			edit: function(e) {
				this.editModal = new Custom({ theme: parseInt($(e.currentTarget).closest(".theme").attr("data-id")) });

				this.editModal.on("save", function() {
					this.model.updateCustom();
				}, this).on("preview", function(theme) {
					this.trigger("preview", theme);
				}, this);

				Track.pageview("Themes: Edit", "/themes/edit");
			},


			/**
			 * Deletes a custom theme
			 *
			 * @api    private
			 * @param  {Event} e The event
			 */
			delete: function(e) {
				if (!confirm(Translate("themes.delete_confirm"))) {
					return false;
				}

				var id = parseInt($(e.currentTarget).closest(".theme").attr("data-id"));

				Cacher.Custom.delete(id, function(err) {
					if (err) {
						alert(Translate("themes.delete_error"));
					}

					this.model.updateCustom();
				}.bind(this));
			},


			/**
			 * Handles the preview click event and parses out the theme image
			 * to trigger the preview event with
			 *
			 * @api    private
			 * @param  {Event} e
			 */
			preview: function(e) {
				e.preventDefault();

				var index = this.model.get("index"),
					themes = this.model.get("themes"),
					custom = Utils.model.get("custom"),
					cached = Utils.model.get("cached"),
					parent = $(e.currentTarget).parents(".theme").first(),
					id = parseInt(parent.attr("data-id") || 0);

				if (parent.hasClass("custom")) {
					Track.event("Themes", "Preview", "custom" + id);
					
					return this.trigger("preview", custom[id], "custom" + id);
				}

				var theme = _.clone(themes[index[id]]);

				if (!theme) return;

				// If already cached don't load remote
				if (cached[theme.id]) {
					theme.image = Utils.getImage(cached[theme.id]);
				}
				else {
					if (theme.images) {
						theme.image = "http://themes.ichro.me/images/" + theme.images[Math.floor(Math.random() * theme.images.length)] + ".jpg";
					}
					else if (theme.oType == "feed") {
						var specs = parent.find(".specs:first"),
							oHtml = specs.html();

						specs.html("<span>" + Translate("themes.feed_fetching") + "</span>");

						return Cacher.prototype.getFeed(function(theme) {
							if (theme === false) {
								specs.html("<span>" + Translate("themes.feed_error") + "</span>");

								setTimeout(function() {
									specs.html(oHtml);
								}, 7000);
							}
							else {
								Track.event("Themes", "Preview", theme.id);

								specs.html(oHtml);

								this.trigger("preview", theme);
							}
						}.bind(this), theme);
					}
					else {
						theme.image = "http://themes.ichro.me/images/" + theme.id + ".jpg";
					}
				}

				Track.event("Themes", "Preview", theme.id);

				this.trigger("preview", theme);
			},


			/**
			 * Handles the use click event, caches the theme and trigger the
			 * use event with the newly cached theme
			 *
			 * @api    private
			 * @param  {Event} e
			 */
			use: function(e) {
				e.preventDefault();

				var index = this.model.get("index"),
					themes = this.model.get("themes"),
					custom = Utils.model.get("custom"),
					parent = $(e.currentTarget).parents(".theme").first(),
					id = parseInt(parent.attr("data-id") || 0);

				if (parent.hasClass("custom")) {
					Track.event("Themes", "Use", "custom" + id);

					return this.trigger("use", custom[id], "custom" + id);
				}

				var theme = _.clone(themes[index[id]]);

				if (!theme) return;


				var specs = parent.find(".specs:first"),
					oHtml = specs.html(),
					config = {
						events: {
							progress: function(total, done) {
								specs.html("<span>" + Translate("themes.caching") + "</span><span>" + Translate("themes.cache_status", done, total) + "</span>");
							},
							complete: function(theme) {
								specs.html(oHtml);

								Track.event("Themes", "Use", theme.id);

								this.trigger("use", theme, theme.id);
							}.bind(this),
							error: function() {
								specs.html("<span>" + Translate("themes.cache_error") + "</span>");

								setTimeout(function() {
									specs.html(oHtml);
								}, 7000);
							}
						}
					};


				if (theme.oType == "sunrise_sunset") {
					navigator.geolocation.getCurrentPosition(function(pos) {
						if (pos && pos.coords) {
							localStorage.lat = parseFloat(pos.coords.latitude.toFixed(2));
							localStorage.lon = parseFloat(pos.coords.longitude.toFixed(2));
						}

						// There's no need to store the cacher in a variable since the events are passed on creation
						new Cacher(theme, config);
					}.bind(this));
				}
				else {
					new Cacher(theme, config);
				}
			},


			/**
			 * Handles nav click events and filters the themes
			 *
			 * @api    private
			 * @param  {Event} e
			 */
			filter: function(e) {
				var elm = $(e.currentTarget),
					id = elm.attr("data-id"),
					themes = [];


				if (id == "custom") {
					themes = this.model.get("custom");
				}
				else if ((id = parseInt(id)) || id === 0) {
					themes = this.model.get("themes").filter(function(e) {
						return e.filterCategories && e.filterCategories.indexOf(id) !== -1;
					});
				}
				else {
					themes = [].concat(this.model.get("custom"), this.model.get("themes"));
				}


				// This fades the container out and back in so the filtering isn't a sudden jolt
				var container = this.$el.addClass("fadeout").children(".container");

				setTimeout(function() {
					container.html(render("themes.listing", {
						themes: themes
					})).scrollTop(0).end().removeClass("fadeout");

					this.images = this.$(".theme .push").toArray();

					this.lazyLoad();
				}.bind(this), 250);


				elm.addClass("active").siblings().removeClass("active");
			},


			/**
			 * Handles thumbnail lazy-loading
			 *
			 * @api    private
			 */
			lazyLoad: function() {
				var length = this.images.length;

				// There might not be any images left to lazy-load
				if (!length) return;

				var coords,
					innerHeight = window.innerHeight; // Querying innerHeight can get costly in a loop

				this.images = this.images.filter(function(img) {
					coords = img.getBoundingClientRect();

					if (((coords.top >= 0 && coords.left >= 0 && coords.top) <= innerHeight)) {
						// This removes the `lazy` class from the image
						img.className = "push";

						return false;
					}

					return true;
				});
			},

			show: function() {
				if (!this.fetched) {
					this.model.fetch();

					this.fetched = true;
				}
				else {
					// Call render to reset the listing
					this.render();
				}

				modal.show();

				Track.pageview("Themes", "/themes");
			},

			initialize: function(options) {
				this.model = new Model();

				var previewOverlay = this.previewOverlay = $('<div class="preview-overlay"></div>');

				modal.mo.appendTo(document.body).after(this.previewOverlay);


				this.on("use", function() {
					modal.hide();
				}, this);

				this.on("preview", function(theme) {
					var css = "",
						body = $(document.body),
						image = Utils.getImage(theme);
					
					// This is a compressed version of the tabs view getCSS function
					if (image)					css += "background-image: url(\"" + image + "\");";
					if (theme.color)			css += "background-color: " + theme.color + ";";
					if (theme.fixed)			css += "background-attachment: " + theme.fixed + ";";
					if (theme.repeat)			css += "background-repeat: " + theme.repeat + ";";
					if (theme.scaling)			css += "background-size: " + theme.scaling + ";";
					if (theme.position)			css += "background-position: " + theme.position + ";";
					if (theme["inline-css"])	css += theme["inline-css"];


					body.attr("data-style", body.attr("style")).attr("style", css);

					previewOverlay.addClass("visible").one("click", function() {
						$(".modal.previewHidden, .modal-overlay.previewHidden").removeClass("previewHidden").addClass("visible");

						previewOverlay.removeClass("visible");

						body.attr("style", body.attr("data-style")).attr("data-style", "");
					});

					$(".modal.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
				}, this);


				var refresh = function() {
					this.$el.html(render("themes", {
						categories: this.model.get("categories")
					}));


					// Unfortunately scroll events don't bubble so this can't be attached in the events hash
					this.$(".container").on("scroll", _.debounce(this.lazyLoad.bind(this), 100, {
						// Never wait more than 100ms, which is only 10x a second and easy for
						// the computer but still snappy to a person
						maxWait: 100,
						leading: true
					}));


					this.render();
				};

				this.model.on("change", refresh, this);

				refresh.call(this);
			},

			render: function() {
				this.$(".container").html(render("themes.listing", {
					themes: [].concat(this.model.get("custom"), this.model.get("themes"))
				}));

				this.images = this.$(".theme .push").toArray();

				this.lazyLoad();
			}
		});

		return View;
	}
);