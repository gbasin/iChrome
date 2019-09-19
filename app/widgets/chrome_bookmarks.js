/*
 * The Chrome Bookmarks widget.
 */
define(["jquery", "lodash", "moment", "browser/api"], function($, _, moment, Browser) {
	return {
		id: 33,
		sort: 90,
		size: 2,
		order: 12,
		permissions: ["bookmarks"],
		nicename: "chrome_bookmarks",
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
				nicename: "from",
				options: "getFolders",
				label: "i18n.settings.from"
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
			from: "1", // Folder #1 is the bookmarks bar
			target: "_self"
		},


		data: {
			bookmarks: [
				{
					title: "Google",
					url: "http://www.google.com/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.google.com/"
				},
				{
					title: "Facebook",
					url: "http://www.facebook.com/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.facebook.com/"
				},
				{
					name: "Sample Folder",
					items: [
						{
							title: "Youtube",
							url: "http://www.youtube.com/",
							favicon: "chrome://favicon/size/16@4x/origin/http://www.youtube.com/"
						},
						{
							title: "Amazon",
							url: "http://www.amazon.com/",
							favicon: "chrome://favicon/size/16@4x/origin/http://www.amazon.com/"
						}
					]
				},
				{
					title: "Wikipedia",
					url: "http://www.wikipedia.org/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.wikipedia.org/"
				}
			]
		},


		/**
		 * Returns a listing of bookmark folders
		 *
		 * @param   {Function}  cb  The callback
		 */
		getFolders: function(cb) {
			if (!Browser.bookmarks) {
				return;
			}

			Browser.bookmarks.getTree(function(d) {
				var folders = _.reduce(d[0].children, function getFolders(res, e) {
					if (e.children) {
						res[e.id] = e.title;

						var subFolders = _.reduce(_.sortBy(e.children, "index"), getFolders, {
							label: e.title
						});

						if (Object.keys(subFolders).length > 1) {
							res[e.id + "_folders"] = subFolders;
						}
					}

					return res;
				}, {});

				cb(folders);
			});
		},


		refresh: function() {
			if (!Browser.bookmarks) {
				return;
			}

			// Even though this is a Chrome API call it takes as long as a web request
			// and therefore should be part of a refresh pattern for faster loading
			Browser.bookmarks.getSubTree(this.config.from, function(d) {
				var getItems = function(e) {
					if (e.children) {
						return {
							name: e.title,
							items: _.map(_.sortBy(e.children, "index"), getItems)
						};
					}
					else {
						return {
							url: e.url,
							favicon: Browser.getFavicon(e.url),
							title: (e.title || "").trim() || (e.url || "").replace(/^[A-z]+\:\/+(?:www\.)?/, "")
						};
					}
				};


				// Bookmarks in the root folder are not sorted properly
				var bookmarks = _.map(_.sortBy(d[0].children, "index"), getItems);

				this.data = {
					bookmarks: bookmarks
				};

				this.render();

				this.utils.saveData(this.data);
			}.bind(this));
		},


		render: function(demo) {
			// These listeners handle updating the widget when changes occur
			if (!this.listening && !demo) {
				this.listening = true;

				var render = this.render.bind(this, false);

				if (Browser.bookmarks) {
					Browser.bookmarks.onCreated.addListener(render);
					Browser.bookmarks.onRemoved.addListener(render);
					Browser.bookmarks.onChanged.addListener(render);
					Browser.bookmarks.onMoved.addListener(render);
					Browser.bookmarks.onChildrenReordered.addListener(render);
				}
			}


			var data = {
				bookmarks: this.data.bookmarks
			};


			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.target && this.config.target === "_blank") {
				data.newTab = true;
			}


			$(this.elm).off("click.folder").on("click.folder", ".list .folder", function() {
				this.classList.toggle("active");
			}).off("click.chromelink").on("click.chromelink", ".list a.link[href^='chrome']", function(e) {
				e.preventDefault();

				var href = this.getAttribute("href");

				Browser.tabs.getCurrent(function(d) {
					if (e.which === 2 || e.currentTarget.target === "_blank") {
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
			});


			this.utils.render(data, {
				listing: this.utils.getTemplate("listing")
			});
		}
	};
});