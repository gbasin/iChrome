/**
 * This generates the main menu
 */
define(
	[
		"lodash", "jquery", "backbone", "browser/api", "core/auth", "core/analytics", "storage/storage", "storage/defaults", "i18n/i18n",
		"search/search", "search/speech", "settings/proxy", "widgets/store", "core/uservoice", "core/render", "core/announcements"
	],
	function(_, $, Backbone, Browser, Auth, Track, Storage, Defaults, Translate, Search, Speech, SettingsProxy, Store, UserVoice, render, Announcements) {
		var Model = Backbone.Model.extend({
				init: function() {
					Storage.on("done updated", function(storage) {
						this.storage = storage;

						var set = _.clone(storage.settings);

						set.links = _.take(set.links, Auth.isPro ? 8 : 3);

						set.tabs = _.map(storage.tabs, function(e) {
							return {
								id: e.id,
								name: e.name || Defaults.tab.name
							};
						});

						this.storage = storage;

						if (JSON.stringify(set) !== JSON.stringify(this.toJSON())) {
							this.set(set);
						}
					}, this);
				}
			}),
			View = Backbone.View.extend({
				tagName: "div",
				className: "menu-container",

				events: {
					"click [data-item]:not(.active)": "effectuate",

					"click a.custom-link": function(e) {
						var href = e.currentTarget.getAttribute("href");

						if (href.indexOf("chrome") === 0 || $("base").attr("target") === "_blank") { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
							e.preventDefault();

							Browser.tabs.getCurrent(function(d) {
								if (e.which === 2) {
									Browser.tabs.create({
										url: href,
										index: d.index + 1
									});
								}
								else {
									Browser.tabs.update(d.id, {
										url: href
									});
								}
							});

							Track.event("Menu", "Link Click", "Chrome");
						}
						else {
							Track.event("Menu", "Link Click");
						}
					},
					"click .tabs .add": function() {
						SettingsProxy.getSettings(function(Settings) {
							Settings("tabs").createTab();
						});
					},
					"click .footer .support": function(e) {
						e.preventDefault();

						UserVoice("show", { mode: "contact" });
					},
					"click .footer .feedback": function(e) {
						e.preventDefault();

						UserVoice("show", { mode: "satisfaction" });
					}
				},


				/**
				 * Handles the menu item click event and triggers the appropriate handler.
				 *
				 * Slightly obscurely, but aptly named.
				 *
				 * @api    private
				 * @param  {Event} e The event
				 */
				effectuate: function(e) {
					var elm = $(e.currentTarget);

					switch (elm.attr("data-item")) {
						case "notifications":
							Announcements.show();
						break;

						case "settings":
							SettingsProxy();
						break;

						case "support":
						{
							var url = "https://ichrome.uservoice.com/knowledgebase";
							Browser.tabs.getCurrent(function(d) {
								Browser.tabs.create({
									url: url,
									index: d !== null && typeof(d) !== 'undefined' ? d.index + 1 : 0
								});
							});

							Track.event("Menu", "Link Click", "Chrome");
						}
						break;

						case "widgets":
							if (!this.Store) {
								this.Store = new Store();
							}

							// This delays displaying the modal until after the init JS is done so the animation is smooth
							requestAnimationFrame(this.Store.show.bind(this.Store));
						break;

						case "editmode":
							e.stopPropagation();

							var state = elm.find(".state");

							if (state.hasClass("enabled")) {
								state.removeClass("enabled").text(Translate("menu.editing_disabled"));

								this.model.storage.settings.editing = false;
							}
							else {
								state.addClass("enabled").text(Translate("menu.editing_enabled"));

								this.model.storage.settings.editing = true;
							}

							$(document.body).toggleClass("no-edit", !this.model.storage.settings.editing);

							this.model.storage.sync();

							Track.event("Menu", "Edit Mode", this.model.storage.settings.editing ? "Enable" : "Disable");
						break;

						case "link":
							if (elm.hasClass("custom") && elm.attr("href").indexOf("chrome") === 0) {
								e.preventDefault();

								Browser.tabs.getCurrent(function(d) {
									if (e.which === 2 || $("base").attr("target") === "_blank") {
										Browser.tabs.create({
											url: elm.attr("href"),
											index: d.index + 1
										});
									}
									else {
										Browser.tabs.update(d.id, {
											url: elm.attr("href")
										});
									}
								});

								Track.event("Menu", "Link Click", "Chrome");
							}
							else {
								Track.event("Menu", "Link Click");
							}
						break;

						case "tab":
							this.navigate(e.currentTarget);

							this.trigger("navigate", parseInt(elm.attr("data-id")));

							Track.event("Menu", "Tab Navigation");
						break;
					}
				},


				/**
				 * Updates the tabs menu to the freshly navigated tab
				 *
				 * @api    public
				 * @param  {Number|String|Element} which  The tab ID or menu element
				 * @param  {Backbone.View}         view   The tab view
				 * @param  {Backbone.Model}        model  The tab model
				 */
				navigate: function(which, view, model) {
					if (typeof which === "string" || typeof which === "number") {
						this.$(".section.tabs div[data-id=" + ((model && model.get("id")) || (which + 1)) + "]").addClass("active").siblings().removeClass("active");
					}
					else {
						$(which).addClass("active").siblings().removeClass("active");
					}
				},


				/**
				 * Shows the menu
				 *
				 * @api    public
				 */
				show: function() {
					this.toggle(true);
				},


				/**
				 * Hides the menu
				 *
				 * @api    public
				 */
				hide: function() {
					this.toggle(false);
				},


				/**
				 * Toggles the menu's visibility
				 *
				 * @api    public
				 */
				toggle: function(show) {
					if (typeof show !== "boolean") {
						show = undefined;
					}

					if (!this.$el.hasClass("visible") && (typeof show === "undefined" || show === true)) {
						// If this doesn't include the toggle switch the event will bubble to the body which will in turn re-hide the menu
						var elms = this.$el.parent();

						elms = elms.find("*").add(elms);

						$(document.body).on("click.menu", function(e) {
							if (!elms.is(e.target)) {
								this.toggle(false);
							}
						}.bind(this));

						this.$el.addClass("visible");

						this.trigger("show");

						Track.event("Menu", "Show");
					}
					else if (this.$el.hasClass("visible") && !show) {
						$(document.body).off("click.menu");

						this.$el.removeClass("visible");

						this.trigger("hide");

						Track.event("Menu", "Hide");
					}
				},


				initialize: function() {
					this.model = new Model();

					// init() needs to be called after the listener is attached to prevent a race
					// condition when storage is already loaded.  It also needs to be here instead
					// of attached directly to new Model() otherwise this.model might not be set yet.
					this.model.on("change", this.render, this).init();

					Announcements.on("countchange", this.render, this);

					// If this was a direct link to the settings, show them
					if (location.hash === "#settings") {
						SettingsProxy();
					}
				},


				/**
				 * Initializes the navigate handler
				 *
				 * @api    private
				 * @param  {Function}       navigate  The navigation callback
				 * @return {Backbone.View}
				 */
				init: function(navigate) {
					return this.on("navigate", navigate);
				},


				render: function() {
					this.model.attributes.notifications = Announcements.count && Announcements.count > 0 ? Announcements.count : null;

					// This enables OK Google hotword detection even when there's only a menu and no toolbar
					if (this.model.get("ok") && !this.Speech) {
						this.Speech = Speech();

						// This calls the search submit handler using the Speech model for settings
						this.Speech.on("result", function(val) {
							if (!this.Search) {
								this.Search = new Search();

								// This is inside the if statement because if the search view already existed
								// it would have caught the event normally
								this.Search.onSpeechResult(val);
							}
						}, this);
					}

					this.$el.html(render("menu", this.model.toJSON()));

					return this;
				}
			});

		return new View();
	}
);