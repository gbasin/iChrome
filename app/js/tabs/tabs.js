/**
 * The tabs container-model.
 */
define(
	["lodash", "jquery", "backbone", "browser/api", "storage/storage", "storage/defaults", "core/status", "modals/alert", "core/analytics", "tabs/collection", "i18n/i18n", "settings/proxy"],
	function(_, $, Backbone, Browser, Storage, Defaults, Status, Alert, Track, Tabs, Translate, SettingsProxy) {
		var Model = Backbone.Model.extend({
				initialize: function() {
					this.tabs = new Tabs();
				},

				init: function() {
					Storage.on("done updated", function(storage, promise, data) {
						if (!(data && data.tabSort)) {
							var defaults = _.assign({}, Defaults.tab, {
								adPlacement: storage.settings.adPlacement,
								isGrid: storage.settings.layout === "grid",
								fixed: storage.settings.columnWidth === "fixed"
							});


							var oTabs = this.get("tabs") || "";

							this.set({
								tabs: JSON.stringify(_.map(storage.tabs, function(e) {
									return _.omit(e, "columns");
								})),
								default: (storage.settings.defaultTab || 1),
								defaults: defaults
							});

							this.storage = storage;

							this.tabs.defaults = defaults;
							this.tabs.default = (storage.settings.defaultTab || 1);


							if (this.get("tabs") !== oTabs) {
								this.tabs.reset(JSON.parse(JSON.stringify(storage.tabs || [])), {
									parse: true
								});
							}
							else {
								this.tabs.set(JSON.parse(JSON.stringify(storage.tabs || [])), {
									parse: true
								});
							}

							this.tabs.navigate();
						}
					}, this);
				}
			}),
			View = Backbone.View.extend({
				tagName: "div",
				className: "tab-container",
				attributes: {
					tabindex: "-1"
				},

				events: {
					"click .tab-nav button": function(e) {
						this.model.tabs.navigate($(e.currentTarget).attr("data-direction"));
					},
					"keydown": function(e) {
						if (e.which === 37) {
							this.model.tabs.navigate("prev");
						}
						else if (e.which === 39) {
							this.model.tabs.navigate("next");
						}
					},
					"keydown .widgets-container .widget": function(e) {
						if (e.currentTarget.className.indexOf("dragged") === -1) {
							e.stopPropagation();
						}
					},
					"mouseover .tab-nav button": function(e) {
						if ($(document.body).hasClass("dragging")) {
							this.timeout = setTimeout(function() {
								this.model.tabs.navigate($(e.currentTarget).attr("data-direction"));
							}.bind(this), 500);
						}
					},
					"mouseout .tab-nav button": function() {
						clearTimeout(this.timeout);
					},

					"click .ad-unit button.hide-ad": function() {
						Alert({
							contents: [Translate("hide_ad.content")],
							buttons: {
								negative: Translate("hide_ad.upgrade"),
								positive: Translate("hide_ad.hide")
							}
						}, function(hide) {
							if (hide) {
								var elm = document.createElement("style");

								elm.innerHTML = ".ad-unit { display: none; }";

								this.$el.before(elm);
							}
							else {
								SettingsProxy("ads");
							}
						}.bind(this));
					},

					"click .upgrade-to-pro": function(e) {
						var titleVar = $(e.currentTarget).data('title');
						if (titleVar === null) { titleVar = "title-default"; }
						var title = Translate("upgrade_to_pro." + titleVar);

						Alert({
							title: title,
							contents: [Translate("upgrade_to_pro.content-default")],
							buttons: {
							negative: Translate("upgrade_to_pro.upgrade"),
								positive: Translate("upgrade_to_pro.close")
							}
						}, function(close) {
							if (close) {
							}
							else {
								SettingsProxy("pro");
							}
						}.bind(this));
					}
				},

				navigate: function(id) {
					this.model.tabs.navigate(id);
				},

				initialize: function(options, navigate) {
					// Sortable must be initialized before the model tries to create the tabs
					this.sortable();

					$(document).bind("deletewidget", function(e, widgetDiv) {
						var item = $(widgetDiv);

						if (!item.hasClass('widget')) {
							return;
						}

						if (confirm(Translate("widgets.delete_confirm"))) {
							item.remove();

							item.removed = true;

							Track.FB.logEvent("WidgetUninstall", null, { fb_content_id: item.attr("data-name") });

							Track.event("Widgets", "Uninstall", item.attr("data-name"));

							this.serialize(true);
						}
					}.bind(this));

					// Listen for ad unit messages
					window.addEventListener("message", function(e) {
						if (e.origin === "http://localhost:4000" || e.origin === "https://ichro.me" || e.origin === "http://ichro.me") {
							var d = {};

							try {
								d = JSON.parse(e.data);
							}
							catch (err) {}

							if (d && d.hideAd) {
								this.$el.find("#" + d.hideAd).remove();
							}
							else if (d && d.showAdsScreen) {
								SettingsProxy("ads");
							}
							else if (d && d.showProScreen) {
								SettingsProxy("pro");
							}
						}
					}.bind(this), false);

					this.model = new Model();

					this.on("navigate", navigate);

					this.model.tabs
						.on("views:change", this.render, this)
						.on("sort columns:save change:columns", function() {
							this.model.storage.tabs = this.model.tabs.toJSON();

							this.model.storage.sync({ tabSort: true });
						}, this)
						.on("navigate", function(index, view, model) {
							this.trigger("navigate", index, view, model);
						}, this);

					// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
					// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
					this.model.on("change", this.render, this).init();
				},


				/**
				 * Initializes the sortable group, since the sortable plugin only uses settings from the first
				 * call for that group this should be initialized from the main tabs view and the the individual
				 * tab views.
				 *
				 * The group is initialized by creating a sortable instance for a detached element and then removing
				 * the element from the sortable group
				 *
				 * @api    private
				 */
				sortable: function() {
					var elm = $("<div></div>");

					var tcOTop = 0,
						tcHeight = 0,
						onGrid = false,
						grid, gridMax,
						body = $(document.body);

					elm.sortable({
						group: "columns",
						handle: ".handle",
						itemSelector: "section",
						dynamicDimensions: true,
						placeholder: "<section class=\"placeholder\"/>",
						onDragStart: function(item) {
							var ret = item.triggerHandler("sortabledragstart", arguments);

							if (ret) {
								item = ret;
							}
							else {
								var css = {
									height: item[0].offsetHeight,
									width: item[0].offsetWidth,
									minWidth: item[0].offsetWidth,
									maxWidth: item[0].offsetWidth
								};

								item.before('<section id="originalLoc"></section>').css(css).addClass("dragged").appendTo("body > .widgets-container");
							}

							var tc = body.addClass("dragging").children(".tab-container")[0];

							tcOTop = tc.offsetTop;
							tcHeight = tc.offsetHeight;
						},
						onDrag: function(item, position) {
							if (item.context) {
								position.top -= item.context.offsetTop;
								position.left -= item.context.offsetLeft;
							}

							if (onGrid) {
								position.left = 10 * Math.round(position.left / 10); // Rounded to nearest 10
								position.top = 10 * Math.round((position.top - tcOTop) / 10) + tcOTop;

								var max = position.top + item[0].offsetHeight - tcOTop;

								if (gridMax > max) {
									max = gridMax;
								}

								grid[0].style.height = (max + 50) + "px";
							}

							item[0].style.top = position.top + "px";
							item[0].style.left = position.left + "px";
						},
						onBeforeDrop: function(item, placeholder) {
							if (placeholder.parent() && placeholder.parent().is(".remove")) {
								if (item.installing || confirm(Translate("widgets.delete_confirm"))) {
									item.remove();

									item.removed = true;

									if (!item.installing) {
										Track.FB.logEvent("WidgetUninstall", null, { fb_content_id: item.attr("data-name") });

										Track.event("Widgets", "Uninstall", item.attr("data-name"));
									}
								}
								else {
									item.insertBefore("#originalLoc");

									item.reset = true;

									item.isMoved = true;
								}

								return false;
							}

							return true;
						},
						onDrop: function(item, container, _super) {
							var css;

							if (item.isMoved) {
								css = {
									top: item.css("top"),
									left: item.css("left"),
									width: item.css("width"),
									height: item.css("height")
								};
							}
							else {
								css = {
									top: item.position().top - tcOTop,
									left: item.position().left,
									width: Math.round(item.outerWidth() / 10) * 10 - 1,
									height: Math.round(item.outerHeight() / 10) * 10 - 1
								};
							}

							_super(item);


							var view = {};

							if (!item.removed && !item.reset && (view = item.data("view"))) {
								view.onGrid = false;

								if (item.parent().parent().hasClass("grid")) {
									item.css(css);

									view.onGrid = true;
								}

								view.refresh();

								if (item.installing) {
									Track.FB.logEvent("WidgetInstall", null, { widgetId: view.widget.name, size: view.model.get("size") });

									Track.queue("widgets", "install", view.widget.name, view.model.get("size"));

									Track.event("Widgets", "Install", view.widget.name);
								}
							}

							// Trigger a repaint so the tabs height is correct, jQuery oddly seems to be the only thing that gets a flicker-free one.
							body.hide(0, function() {
								body.show();
							});

							$("#originalLoc").remove();

							this.serialize(true);
						}.bind(this),
						afterMove: function(placeholder, container) {
							if (container.el[0].className.indexOf("widgets-container") === -1) {
								onGrid = false;

								placeholder[0].style.width = container.group.item[0].offsetWidth + "px";
								placeholder[0].style.height = container.group.item[0].offsetHeight + "px";

								if (container.group.item.hasClass("tiny")) {
									placeholder.addClass("tiny");
								}
								else {
									placeholder.removeClass("tiny");
								}
							}
							else {
								onGrid = true;

								grid = container.el;

								gridMax = tcHeight - 50;

								var h;

								_.each(grid[0].querySelectorAll(".widget"), function(e) {
									h = e.offsetTop + e.offsetHeight;

									if (h >= gridMax) { gridMax = h; }
								});
							}
						}
					});


					var dta = elm.data("sortable");

					if (dta) {
						if (dta.rootGroup.containers.length === 1) {
							dta.rootGroup.containers = [];
						}
						else {
							_.remove(dta.rootGroup.containers, function(e) {
								return elm.is(e.el);
							});
						}
					}

					return elm;
				},


				/**
				 * Calls serialize on each of the tabs, optionally re-rendering them
				 *
				 * @api    private
				 * @param  {Boolean}  [render]  If the tabs should be re-rendered
				 */
				serialize: function(render) {
					_.invoke(this.model.tabs.views, "serialize");

					// Since the render only inserts columns and widgets it's not expensive
					// This is called in requestAnimationFrame so there isn't a visible freeze
					if (render === true) {
						window.requestAnimationFrame(function() {
							_.invoke(this.model.tabs.views, "render");
						}.bind(this));
					}

					this.model.storage.tabs = this.model.tabs.toJSON();

					this.model.storage.sync({ tabSort: true });
				},

				render: function() {
					// If the tabs are not detached and are still active then when the .html() is called the
					// jQuery data will be removed from all descendants (including columns), destroying sorting.
					$(_.pluck(this.model.tabs.views, "el")).detach();


					this.$el
						.html(
							'<div class="tab-nav">' +
								'<button type="button" class="material fab m-icon prev" data-direction="prev">navigate_before</button>' +
								'<button type="button" class="material fab m-icon next" data-direction="next">navigate_next</button>' +
							'</div>'
						)
						.toggleClass("one-tab", this.model.tabs.length === 1)
						.append(_.pluck(this.model.tabs.views, "el"));

					_.each(this.model.tabs.views, function(e) {
						e.trigger("inserted");
					});

					return this;
				}
			});

		return View;
	}
);