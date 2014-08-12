/**
 * The Getting Started guide, this is only shown once on installation or when opened manually from the settings
 */
define(
	["jquery", "backbone", "modals/modals", "storage/defaults", "storage/storage", "core/analytics", "widgets/widgets", "core/templates"],
	function($, Backbone, Modal, Defaults, Storage, Track, Widgets, render) {
		var installed = localStorage["installed"] == "true",
			getPage = function(form) {
				var widgets = [],
					columns = [[], [], []],
					columnWeights = [0, 0, 0];

				form.serializeArray().forEach(function(e, i) {
					var id = parseInt(e.name.split("widget-")[1]),
						widget = (Widgets[id] || { size: 3, config: { size: "medium" } });

					if (!widget.config) {
						widget.config = {
							size: "medium"
						};
					}
					else if (!widget.config.size) {
						widget.config.size = (widget.sizes || ["medium"])[0];
					}

					widgets.push([id, widget.size, widget.config.size ]);
				});

				widgets.sort(function(a, b) {
					return b[1] - a[1];
				}).forEach(function(e, i) {
					if (Widgets[e[0]]) {
						var minWeight = Math.min.apply(Math, columnWeights),
							smallest = columnWeights.lastIndexOf(minWeight);

						columns[smallest].push({
							id: e[0],
							size: e[2]
						});

						columnWeights[smallest] += e[1];
					}
				});

				return columns;
			},
			modal = new (Modal.extend({
				classes: "getting-started",
				close: function() {
					if (confirm(
						"Are you sure you want to exit this guide?\r\n" +
						"You can show it again anytime by hitting \"Installation guide\" from the settings menu."
					)) {
						delete localStorage["installed"];

						installed = false;

						this.hide();

						$(document.body).removeClass("guide");
					}
				}
			})),
			View = Backbone.View.extend({
				el: modal.content,
				events: {
					"click .btn:not(.disabled)": "navClick",
					"click .share .buttons a": "share",
					"click .share input": function(e) {
						e.currentTarget.select();
					}
				},
				navClick: function(e) {
					e.preventDefault();

					var elm = $(e.currentTarget),
						page = elm.parents(".tab").first().removeClass("active")[elm.hasClass("prev") ? "prev" : "next"]();

					if (page.length) {
						page.addClass("active");
					}
					else {
						modal.hide();

						Storage.done(function(storage) { // Because of the way promises work, this can be here without an issue
							if (installed) {
								storage.tabs[0].columns = getPage(this.$("form"));
							}

							delete localStorage["installed"];

							installed = false;

							Storage.trigger("updated");
						}.bind(this));
					}
				},
				share: function(e) {
					e.preventDefault();

					chrome.windows.create({
						width: 550,
						height: 550,
						type: "detached_panel",
						url: e.currentTarget.getAttribute("href")
					});

					Track.event("GSShare", e.currentTarget.getAttribute("data-which"));
				},
				show: function() {
					if (!this.rendered) {
						this.render();
					}

					modal.show();

					$(document.body).addClass("guide");

					Track.pageview("/guide");
				},
				initialize: function() {
					modal.mo.appendTo(document.body);

					if (installed) {
						this.show();
					}
				},
				render: function() {
					var widgets = [],
						defaults = Defaults.widgets,
						id, widget;

					for (id in Widgets) {
						if (widgets.length >= 28) break;

						widget = Widgets[id];

						if (widget.permissions) continue;

						if (defaults.indexOf(parseInt(id)) !== -1) {
							widgets.push({
								id: id,
								name: widget.name,
								desc: widget.desc
							});
						}
						else {
							widgets.push([id, widget.name, widget.desc]);
						}
					}

					this.$el.html(render("getting-started", {
						id: chrome.app.getDetails().id,
						widgets: widgets,
						second: !installed
					}));

					this.rendered = true;
				}
			});

		return new View();
	}
);