/**
 * This generates the toolbar and its submodules
 */
define(["lodash", "jquery", "backbone", "storage/storage", "search/search", "settings/settings", "storage/defaults", "core/templates"], function(_, $, Backbone, Storage, Search, Settings, Defaults, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					var set = _.clone(storage.settings);

					set.tabMenu = _.map(storage.tabs, function(e, i) {
						return {
							id: e.id,
							name: e.name || Defaults.tab.name
						};
					});

					this.storage = storage;

					this.set(set);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "header",
			className: "toolbar",

			events: {
				"click .apps": "appsPanel",
				"click .icon.settings": function() { // This has to be proxied since Backbone event handlers are bound to this
					this.Settings.show();
				},
				"click .tabs-menu li:not(.active):not([data-id=new])": function(e) {
					this.navigate(e.currentTarget);

					this.trigger("navigate", parseInt(e.currentTarget.getAttribute("data-id")));
				},
				"click .tabs-menu li[data-id=new]": function(e) {
					Settings.createTab();
				},
				"click .custom-link": function(e) {
					var href = e.currentTarget.getAttribute("href");

					if (href.indexOf("chrome") == 0) { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
						e.preventDefault();

						chrome.tabs.getCurrent(function(d) {
							if (e.which == 2) {
								chrome.tabs.create({
									url: href,
									index: d.index + 1
								});
							}
							else {
								chrome.tabs.update(d.id, {
									url: href
								});
							}
						});
					}
				},
				"click .apps a.icon": function(e) {
					e.preventDefault();
				}
			},


			/**
			 * Shows and hides the apps panel
			 *
			 * @api    private
			 * @param  {Event} e The event
			 */
			appsPanel: function(e) {
				var elm = $(e.currentTarget),
					panel = elm.find(".panel");

				if (!panel.hasClass("visible")) {
					if (!this.appsLoaded) {
						elm.find("img[data-src]").each(function(e, i) {
							this.setAttribute("src", this.getAttribute("data-src"));

							this.setAttribute("data-src", null);
						});

						this.appsLoaded = true;
					}

					var elms = elm.find("*");

					$(document.body).on("click.apps", function(e) {
						if (!elms.is(e.target)) {
							panel.removeClass("visible");

							$(document.body).off("click.apps");
						}
					});

					panel.addClass("visible");
				}
				else {
					$(document.body).off("click.apps");

					panel.removeClass("visible");
				}
			},


			/**
			 * Updates the tabs menu to the freshly navigated tab
			 *
			 * @api    public
			 * @param  {Number|String|Element} which The tab ID or menu element
			 * @param  {Backbone.View} view          The tab view
			 * @param  {Backbone.Model} model        The tab model
			 */
			navigate: function(which, view, model) {
				if (typeof which == "string" || typeof which == "number") {
					this.$(".tabs-menu li[data-id=" + ((model && model.get("id")) || (which + 1)) + "]").addClass("active").siblings().removeClass("active");
				}
				else {
					$(which).addClass("active").siblings().removeClass("active");
				}
			},


			initialize: function(options, navigate) {
				this.model = new Model();

				this.on("navigate", navigate);

				this.Search = new Search();

				this.Search
					.on("typing:start", function() {
						this.$el.toggleClass("typing", true);
					}, this)
					.on("typing:end", function() {
						this.$el.toggleClass("typing", false);
					}, this);

				this.Settings = Settings;

				// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
				// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
				this.model.on("change", this.render, this).init();
			},


			/**
			 * Initializes the tabs menu sortable
			 *
			 * @api    private
			 */
			menu: function() {
				this.$(".tabs-menu ul").sortable({
					handle: ".move",
					itemSelector: "li",
					placeholder: "<li class=\"holder\"/>",
					onDragStart: function(item, container, _super) {
						item.css({
							height: item.outerHeight(),
							width: item.outerWidth()
						}).addClass("dragged").siblings("[data-id=new]").remove();
					},
					onDrag: function(item, position, _super) {
						var pos = $(item.context).position();

						position.top -= pos.top + 10;
						position.left -= pos.left + 10;

						item.css(position);
					},
					onDrop: function(item, container, _super) {
						_super(item, container);

						var newtabs = [],
							tab,
							set = false;

						this.$(".tabs-menu ul").sortable("serialize").toArray().forEach(function(e, i) {
							if (tab = this.model.storage.tabs[e - 1]) {
								tab.id = i + 1;

								if (!set && this.model.storage.settings.def == e) {
									this.model.storage.settings.def = tab.id;

									set = true;
								}

								newtabs.push(tab);
							}
						}.bind(this));

						this.model.storage.tabs = newtabs;

						Storage.trigger("updated");

						panel.addClass("visible");
					}.bind(this),
					serialize: function(item, children, isContainer) {
						if (isContainer) {
							return children;
						}
						else {
							if (item.attr("data-id") !== "new") return parseInt(item.attr("data-id"));
						}
					}
				});
			},


			/**
			 * Overrides Backbone's remove method
			 *
			 * @api    private
			 * @param  {sortable} [sortable] Whether or not only sortable should be removed
			 */
			remove: function(sortable) {
				// jQuery sortable doesn't have a method for removing containers from
				// groups without destroying the entire group or for accessing them directly.
				// 
				// So, we have to get the rootGroup directly from an element's `data` which we
				// can then cleanup.
				var elms = this.$(".tabs-menu ul"),
					dta = elms.first().data("sortable");

				if (dta) {
					var rootGroup = dta.rootGroup;

					rootGroup.containers = [];
				}


				if (sortable !== true) Backbone.View.prototype.remove.call(this);
			},

			render: function() {
				// The app icons attributes get reset on render
				this.appsLoaded = false;

				this.Search.$el.detach();

				this.$el
					.toggleClass("hidden", this.model.get("toolbar"))
					.html(render("toolbar", this.model.toJSON()));

				this.$(".search").replaceWith(this.Search.el);

				this.menu();

				return this;
			}
		});

	return View;
});