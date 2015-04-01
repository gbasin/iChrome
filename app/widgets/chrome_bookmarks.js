/*
 * The Chrome Bookmarks widget.
 */
define(["jquery", "lodash", "moment"], function($, _, moment) {
	return {
		id: 33,
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
					date: "8:06 AM",
					url: "http://www.google.com/"
				},
				{
					title: "Facebook",
					date: "Yesterday",
					url: "http://www.facebook.com/"
				},
				{
					name: "Sample Folder",
					items: [
						{
							title: "Youtube",
							date: "Yesterday",
							url: "http://www.youtube.com/"
						},
						{
							title: "Amazon",
							date: "Monday",
							url: "http://www.amazon.com/"
						}
					]
				},
				{
					title: "Wikipedia",
					date: "Mar 5th 2015",
					url: "http://www.wikipedia.org/"
				}
			]
		},


		/**
		 * Returns a listing of bookmark folders
		 *
		 * @param   {Function}  cb  The callback
		 */
		getFolders: function(cb) {
			if (!chrome.bookmarks) return;

			chrome.bookmarks.getTree(function(d) {
				var folders = _.reduce(d[0].children, function getFolders(res, e) {
					if (e.children) {
						res[e.id] = e.title;

						var subFolders = _.reduce(e.children, getFolders, {
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
			if (!chrome.bookmarks) return;

			// Even though this is a Chrome API call it takes as long as a web request
			// and therefore should be part of a refresh pattern for faster loading
			chrome.bookmarks.getSubTree(this.config.from, function(d) {
				var bookmarks = _.map(d[0].children, function getItems(e) {
					if (e.children) {
						return {
							name: e.title,
							items: _.map(e.children, getItems)
						};
					}
					else {
						var date = moment(e.dateAdded);

						if (date.diff(new Date(), "days") + 1 > 7) {
							date = date.format("MMM Do YYYY");
						}
						else {
							date = date.calendar().replace(" at 12:00 AM", "").replace("Today at ", "");
						}

						return {
							url: e.url,
							date: date,
							title: (e.title || "").trim() || (e.url || "").replace(/^[A-z]+\:\/+(?:www\.)?/, "")
						};
					}
				});

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

				if (chrome.bookmarks) {
					chrome.bookmarks.onCreated.addListener(render);
					chrome.bookmarks.onRemoved.addListener(render);
					chrome.bookmarks.onChanged.addListener(render);
					chrome.bookmarks.onMoved.addListener(render);
					chrome.bookmarks.onChildrenReordered.addListener(render);
				}
			}


			var data = {
				bookmarks: this.data.bookmarks
			};

			if (demo) {
				data.bookmarks[3].date = moment().subtract(18, "days").format("MMM Do YYYY");
			}


			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.target && this.config.target == "_blank") {
				data.newTab = true;
			}


			$(this.elm).off("click.folder").on("click.folder", ".list .folder", function() {
				this.classList.toggle("active");
			}).off("click.chromelink").on("click.chromelink", ".list a.link[href^='chrome']", function(e) {
				e.preventDefault();

				var href = this.getAttribute("href");

				chrome.tabs.getCurrent(function(d) {
					if (e.which == 2 || e.currentTarget.target == "_blank") {
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
			});


			this.utils.render(data, {
				listing: this.utils.getTemplate("listing")
			});
		}
	};
});