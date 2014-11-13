/*
 * The Todo widget.
 */
define(["jquery"], function($) {
	return {
		id: 17,
		size: 2,
		order: 17,
		nicename: "todo",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "radio",
				nicename: "font",
				label: "i18n.settings.color",
				options: {
					light: "i18n.settings.color_options.light",
					dark: "i18n.settings.color_options.dark"
				}
			},
			{
				type: "list",
				color: true,
				nicename: "tags",
				label: "i18n.settings.tags",
				placeholder: "i18n.settings.tags_placeholder"
			}
		],
		config: {
			title: "i18n.title",
			size: "variable",
			tags: [],
			font: "dark"
		},
		syncData: {
			items: [
				{
					title: "These are sample to-do items"
				},
				{
					title: "This one is important",
					important: true
				},
				{
					title: "This one is done",
					done: true
				},
				{
					title: "And this one is undone"
				}
			]
		},
		save: function() {
			this.syncData.items = this.sortable.sortable("serialize").get();

			this.utils.saveConfig(this.syncData);
		},
		addItem: function(title, after) {
			if (typeof title !== "string") {
				after = title;
				title = "";
			}

			var html = '<div class="item"><div class="check">&#xE677;</div><input class="title" type="text" maxlength="255" value="' +
				title + '" /><div class="tools"><span class="tag">&#xE629;</span><span class="delete">&#xE678;</span><span class="m' +
						'ove">&#xE693;</span><div class="tags"><div data-color="none">None</div><div data-color="important" style="' +
						'background-color: #FFECEC;">Important</div>' +
							this.config.tags.map(function(e) {
								return '<div data-color="' + e.color + '" style="background-color: ' + e.color + ';">' + e.name + '</div>';
							}) +
						'</div></div></div>';

			if (after) $(html).insertAfter(after).find(".title").focus();
			else $(html).appendTo(this.sortable).find(".title").focus();

			this.save();
		},
		render: function() {
			if (this.data) {
				this.syncData = $.extend(true, {}, this.data);

				delete this.data;
			}

			var data = $.extend({}, this.syncData || {});

			data.tags = this.config.tags;

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.font == "light") {
				data.font = "#FAFAFA";
				data.ifont = "#FFF";
			}

			this.utils.render(data);

			var that = this;

			this.sortable = this.elm.off(".todo").on("click.todo", ".item .delete", function(e) {
				$(this).parent().parent().slideUp(function() {
					$(this).remove();

					that.save.call(that);
				});
			}).on("click.todo", ".item .tags div", function(e) {
				var color = $(this).attr("data-color");

				if (color == "none") {
					$(this).parents(".item").attr("data-color", "").attr("style", "").removeClass("important");
				}
				else if (color == "important") {
					$(this).parents(".item").attr("data-color", "").attr("style", "").addClass("important");
				}
				else {
					$(this).parents(".item").first().removeClass("important").attr("data-color", color).css("background-color", color);
				}

				that.save.call(that);
			}).on("click.todo", ".item .check", function(e) {
				$(this).parent().toggleClass("done");

				that.save.call(that);
			}).on("keydown.todo", ".item .title", function(e) {
				if (e.which == 13) {
					e.preventDefault();

					that.addItem.call(that, $(this).parent());
				}
			}).on("input.todo", ".item .title", function(e) {
				that.save.call(that);
			}).on("click.todo", ".new", function(e) {
				that.addItem.call(that);
			}).find(".list").sortable({
				handle: ".move",
				itemSelector: ".item",
				placeholder: "<div class=\"item holder\"/>",
				onDragStart: function(item, container, _super) {
					item.css({
						height: item.outerHeight(),
						width: item.outerWidth()
					});

					item.addClass("dragged");
				},
				onDrag: function(item, position, _super) {
					var ctx = $(item.context),
						ctp = ctx.position(),
						ctpp = ctx.parent().position();

					position.top -= ctp.top + ctpp.top + 10;
					position.left -= ctp.left + ctpp.left + 10;

					item.css(position);
				},
				onDrop: function(item, container, _super) {
					that.save.call(that);

					_super(item, container);
				},
				serialize: function(item, children, isContainer) {
					if (isContainer) {
						return children;
					}
					else {
						var ret =  {
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
	};
});