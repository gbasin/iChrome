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
				nicename: "sync",
				label: "i18n.settings.sync",
				options: {
					0: "i18n.settings.sync_options.id",
					1: "i18n.settings.sync_options.path"
				}
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
			frompath: "",
			target: "_self",
			sync: "0"
		},


		data: {
			bookmarks: [
				{
					title: "Google",
					url: "https://www.google.com/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.google.com/"
				},
				{
					title: "Facebook",
					url: "https://www.facebook.com/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.facebook.com/"
				},
				{
					name: "Sample Folder",
					items: [
						{
							title: "Youtube",
							url: "https://www.youtube.com/",
							favicon: "chrome://favicon/size/16@4x/origin/http://www.youtube.com/"
						},
						{
							title: "Amazon",
							url: "https://www.amazon.com/",
							favicon: "chrome://favicon/size/16@4x/origin/http://www.amazon.com/"
						}
					]
				},
				{
					title: "Wikipedia",
					url: "https://www.wikipedia.org/",
					favicon: "chrome://favicon/size/16@4x/origin/http://www.wikipedia.org/"
				}
			]
		},

		flatFolders: function() {
			if (this.folders === null) {
				return [];
			}

			function isNormalInteger(str) {
				var n = Math.floor(Number(str));
				return n !== Infinity && String(n) === str && n >= 0;
			}			

			var foldersByKey = function(current, path) {
				var result = [];

				for (var propertyName in current) {
					if (current.hasOwnProperty(propertyName)) {
						if (isNormalInteger(propertyName)) {
							result.push({ key: propertyName, value: path.concat([current[propertyName]]).join("/|`") });
						}else if (propertyName.endsWith("_folders")) {
							result = result.concat(foldersByKey(current[propertyName], path.concat([current[propertyName.substring(0, propertyName.length - 8)]])));
						}

					}
				}				

				return result;
			};

			return foldersByKey(this.folders, []);
		},


		adjustConfig: function(config) {
			if (!config || !config.from || !this.folders) {
				return;
			}

			config.fromPath = "";
			if (config.from !== "1") {
				var found = this.flatFolders().filter(function(i) { return i.key === config.from; } );
				if (found && found.length === 1) {
					config.fromPath = found[0].value;
				}
			}
		},

		folders: {},

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

				this.folders = folders;

				cb(folders);
			}.bind(this));
		},


		refresh: function() {
			if (!Browser.bookmarks) {
				return;
			}

			var refreshTree = function(from)
			{
				// Even though this is a Chrome API call it takes as long as a web request
				// and therefore should be part of a refresh pattern for faster loading
				Browser.bookmarks.getSubTree(from, function(d) {
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
			}.bind(this);

			var from = this.config.from;
			
			if (this.config.sync === "1" && from !== "1" && this.config.fromPath) {
				this.getFolders(function() {
					if (this.folders) {
						var ff = this.flatFolders();
						var found = ff.filter(function(i) { return i.value === this.config.fromPath; }.bind(this) );
						if (found && found.length > 0 && !found.find(function(i) { return i.key === from; })) {
							if (found.length === 1) {
								from = found[0].key;
							}
						}
					}

					refreshTree(from);
				}.bind(this));
			}

			refreshTree(from);
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