define(["jquery", "widgets/views/main", "lib/jquery.sortable"], function($, WidgetView) {
	return WidgetView.extend({
		events: {
			"input .item .title": "serialize",

			"click .header .new": function() {
				this.addItem();
			},

			"click .item .delete": function(e) {
				var elm = $(e.currentTarget).parent().parent().slideUp(function() {
					elm.remove();

					this.serialize();
				}.bind(this));
			},

			"click .item .tags div": function(e) {
				var color = e.currentTarget.getAttribute("data-color"),
					item = $(e.currentTarget).parents(".item");

				if (color === "none" || color === "important") {
					item.attr("data-color", "").attr("style", "")[color === "none" ? "removeClass" : "addClass"]("important");
				}
				else {
					item.first().removeClass("important").attr("data-color", color).css("background-color", color);
				}

				this.serialize();
			},

			"change .item .check": function(e) {
				$(e.currentTarget).parent().toggleClass("done", e.currentTarget.checked);

				this.serialize();
			},

			"keydown .item .title": function(e) {
				if (e.which === 13) {
					e.preventDefault();

					this.addItem($(e.currentTarget).parent());
				}
			}
		},

		initialize: function() {
			// We check the viewChange flag so we don't re-render every time a
			// box is ticked or an item moved
			this.listenTo(this.model, "change", function(model, options) {console.log(options);
				if (!options.viewChange) {
					this.render();
				}
			});

			this.render();
		},

		serialize: function() {
			this.model.set("syncData", {
				items: this.sortable.sortable("serialize").get()
			}, {
				viewChange: true
			});
		},

		addItem: function(title, after) {
			if (typeof title !== "string") {
				after = title;
				title = "";
			}

			var html = '<div class="item"><input type="checkbox" class="check"/><input class="title" type="text" maxlength="255" value="' +
				title + '" /><div class="tools"><span class="tag">&#xE629;</span><span class="delete">&#xE678;</span><span class="m' +
						'ove">&#xE693;</span><div class="tags"><div data-color="none">None</div><div data-color="important" style="' +
						'background-color: #FFECEC;">Important</div>' +
							this.model.config.tags.map(function(e) {
								return '<div data-color="' + e.color + '" style="background-color: ' + e.color + ';">' + e.name + '</div>';
							}) +
						'</div></div></div>';

			if (after) $(html).insertAfter(after).find(".title").focus();
			else $(html).appendTo(this.sortable).find(".title").focus();

			this.serialize();
		},

		onBeforeRender: function(data) {
			data.items = this.model.syncData.items;

			data.tags = this.model.config.tags;

			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			if (this.model.config.font === "light") {
				data.font = "#FAFAFA";
				data.ifont = "#FFF";
			}

			return data;
		},

		onRender: function() {
			this.sortable = this.$(".list").sortable({
				handle: ".move",
				itemSelector: ".item",
				placeholder: "<div class=\"item holder\"/>",
				onDragStart: function(item) {
					item.css({
						height: item.outerHeight(),
						width: item.outerWidth()
					});

					item.addClass("dragged");
				},
				onDrag: function(item, position) {
					var ctx = $(item.context),
						ctp = ctx.position(),
						ctpp = ctx.parent().position();

					position.top -= ctp.top + ctpp.top + 10;
					position.left -= ctp.left + ctpp.left + 10;

					item.css(position);
				},
				onDrop: function(item, container, _super) {
					this.serialize();

					_super(item, container);
				}.bind(this),
				serialize: function(item, children, isContainer) {
					if (isContainer) {
						return children;
					}
					else {
						var ret = {
							title: item.find(".title").val().trim().slice(0, 255)
						};

						if (item.attr("data-color")) {
							ret.color = item.attr("data-color");
						}
						else if (item.hasClass("important")) {
							ret.important = true;
						}

						if (item.hasClass("done")) {
							ret.done = true;
						}

						return ret;
					}
				}
			});
		}
	});
});