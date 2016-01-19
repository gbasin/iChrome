/*
 * The Bookmarks widget.
 */
define(["jquery", "lodash", "browser/api", "modals/modals", "lib/parseurl"], function($, _, Browser, Modal, parseUrl) {
	return {
		id: 16,
		size: 2,
		order: 12,
		unlisted: true,
		nicename: "bookmarks",
		sizes: ["tiny", "variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "columns",
				label: "i18n.settings.layout",
				options: {
					one: "i18n.settings.layout_options.single",
					two: "i18n.settings.layout_options.double"
				},
				sizes: ["variable"]
			},
			{
				type: "radio",
				nicename: "target",
				label: "i18n.settings.open",
				options: {
					_self: "i18n.settings.open_options.current",
					_blank: "i18n.settings.open_options.blank"
				}
			}
		],
		config: {
			title: "i18n.name",
			size: "variable",
			columns: "one",
			target: "_self"
		},
		syncData: {
			bookmarks: [
				{
					title: "Google",
					url: "http://www.google.com/"
				},
				{
					title: "Facebook",
					url: "http://www.facebook.com/"
				},
				{
					title: "Youtube",
					url: "http://www.youtube.com/"
				},
				{
					title: "Amazon",
					url: "http://www.amazon.com/"
				},
				{
					title: "Wikipedia",
					url: "http://www.wikipedia.org/"
				}
			]
		},
		save: function() {
			this.syncData.bookmarks = this.sortable.sortable("serialize").get();

			this.utils.saveData(this.syncData);
		},
		addItem: function(data) {
			var html = '<a class="link drag" href="' + data.url + '"><img class="favicon" src="' + Browser.getFavicon(data.url) +
				'" /><span class="title">' + data.title + '</span><div class="tools"><span class="' +
				'edit">	&#xE606;</span><span class="delete">&#xE678;</span><span class="move">&#xE693;</span></div>';

			this.editItem($(html).appendTo(this.sortable));

			this.save();
		},
		editItem: function(item) {
			var modal = this.modal;

			modal.url.val(item.attr("href"));
			modal.title.val(item.find(".title").text());

			modal.save = function(e) {
				e.preventDefault();

				this.adding = false;

				modal.hide();

				item.attr("href", parseUrl(modal.url.val().trim()))
					.find(".title").text(modal.title.val().trim()).end()
					.find(".favicon").attr("src", Browser.getFavicon(parseUrl(modal.url.val().trim())));

				this.save();
			}.bind(this);

			modal.show();
		},
		adding: false,
		render: function() {
			if (this.data) {
				this.syncData = _.cloneDeep(this.data);

				delete this.data;
			}

			var data = _.clone(this.syncData);

			data.bookmarks = data.bookmarks.map(function(e) {
				e = _.clone(e);

				e.favicon = Browser.getFavicon(e.url);

				return e;
			});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.columns && this.config.columns !== "one" && this.config.size !== "tiny") {
				data.two = true;
			}

			if (this.config.target && this.config.target === "_blank") {
				data.newTab = true;
			}

			this.utils.render(data, {
				listing: this.utils.getTemplate("listing")
			});


			var modalHTML = '<h2 class="title">' + this.utils.translate("edit.dialog_title") + '</h2>' +
				'<form>' +
					'<div class="form-group">' +
						'<label for="bookmark-title">' + this.utils.translate("edit.title") + '</label>' +
						'<input type="text" class="form-control" id="bookmark-title" maxlength="255" placeholder="' + this.utils.translate("edit.title_placeholder") + '" />' +
					'</div>' +

					'<div class="form-group">' +
						'<label for="bookmark-url">' + this.utils.translate("edit.url") + '</label>' +
						'<input type="text" class="form-control" id="bookmark-url" maxlength="500" placeholder="' + this.utils.translate("edit.url_placeholder") + '" />' +
					'</div>' +

				'</form>' +

				'<button class="btn btn-primary">' + this.utils.translate("edit.save") + '</button>';

			this.modal = new (Modal.extend({
				width: 400,
				height: 290,
				classes: "bookmarks-modal",
				close: function() {
					this.adding = false;

					this.modal.hide();
				}.bind(this)
			}))();

			this.modal.mo.appendTo(document.body);

			this.modal.content.html(modalHTML);

			this.modal.save = function() {};

			this.modal.title = this.modal.$("#bookmark-title");
			this.modal.url = this.modal.$("#bookmark-url");
			this.modal.btn = this.modal.$(".btn").click(function(e) {
				this.modal.save(e);
			}.bind(this));

			this.modal.title.add(this.modal.url).on("keydown", function(e) {
				if (e.which === 13) {
					this.modal.save(e);
				}
			}.bind(this));

			var that = this;

			this.sortable = this.elm.on("click", "a.link", function(e) {
				var href = this.getAttribute("href");

				if (href.indexOf("chrome") === 0 && !$(e.target).is(".tools span")) { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
					e.preventDefault();

					Browser.tabs.getCurrent(function(d) {
						if (e.which === 2 || (e.currentTarget.target || $("base").attr("target")) === "_blank") {
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
				}
			}).on("click", ".link .delete", function(e) {
				e.preventDefault();

				$(this).parent().parent().slideUp(function() {
					$(this).remove();

					that.save.call(that);
				});
			}).on("click", ".link .edit", function(e) {
				e.preventDefault();

				that.editItem.call(that, $(this).parent().parent());
			}).on("click", ".folder", function(e) {
				if ($(e.target).is(".folder, .name")) {
					e.preventDefault();
					e.stopPropagation();

					$(this).toggleClass("active");
				}
			}).on("click", ".folder > .tools .delete", function(e) {
				e.preventDefault();

				$(this).parents(".folder").first().slideUp(function() {
					$(this).remove();

					that.save.call(that);
				});
			}).on("click", ".folder > .tools .edit", function(e) {
				e.preventDefault();

				$(this).parents(".folder")
					.first()
					.children(".name")
					.attr("disabled", false)
					.focus()
					.on("click", function(e) {
						e.stopPropagation();
					}).one("focusout", function() {
						$(this).attr("disabled", true);

						that.save.call(that);
					}).on("keydown", function(e) {
						if (e.which === 13) {
							$(this).off("click keydown").focusout();
						}
					});
			}).on("dragenter dragover", function() {

				$(this).find(".drop").addClass("active");

			}).on("dragleave dragexit", ".drop", function() {

				$(this).removeClass("active");

			}).on("input", ".catch", function(e) {
				e.preventDefault();

				var link = $(this).find("a").first();

				if (link.length) {
					that.addItem.call(that, {
						title: link.text(),
						url: link.attr("href")
					});
				}

				link.end().end().html("").parent().removeClass("active");
			}).on("click", ".new > a", function() {
				if (!that.adding) {
					if ($(this).attr("data-type") === "folder") {
						var html = '<div class="folder drag"><input type="text" class="name" disabled /><div class="tools"><span class="' +
							'edit">	&#xE606;</span><span class="delete">&#xE678;</span><span class="move">&#xE693;</span><div class="items"></div></div>';

						$(html).appendTo(that.sortable).find(".edit").click();

						that.save.call(that);
					}
					else {
						that.adding = true;

						that.addItem.call(that, {
							title: "",
							url: ""
						});
					}
				}
			}).find(".list").sortable({
				handle: ".move",
				group: "bookmarks",
				itemSelector: ".drag",
				dynamicDimensions: true,
				containerSelector: ".folder .items, .list",
				placeholder: "<a class=\"link holder\"/>",
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
					that.save.call(that);

					_super(item, container);
				},
				serialize: function(item, children, isContainer) {
					if (isContainer) {
						return children;
					}
					else {
						if (item.hasClass("folder")) {
							return {
								name: item.find(".name").val().trim().slice(0, 255),
								items: children[0] ? children : []
							};
						}
						else {
							return {
								title: item.find(".title").text().trim().slice(0, 255),
								url: item.attr("href").trim().slice(0, 500)
							};
						}
					}
				},
			});
		}
	};
});