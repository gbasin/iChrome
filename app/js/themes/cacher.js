/**
 * This manages theme downloading and caching
 */
define(["lodash", "jquery", "hogan", "backbone", "storage/filesystem", "storage/storage", "core/status"], function(_, $, Hogan, Backbone, FileSystem, Storage, Status) {
	var Model = Backbone.Model.extend({
		initialize: function() {
			Storage.on("done updated", function(storage) {
				this.set({
					custom: storage.themes,
					cached: storage.cached
				});

				this.storage = storage;
			}, this);
		}
	});


	/**
	 * The cacher utility
	 *
	 * @constructor
	 * @api   public
	 * @param {Object}  theme                  The theme to cache
	 * @param {Object}  [options]              The cache options
	 * @param {Object}  [options.events]       A hash of events to attach to the cacher
	 * @param {Boolean} [options.manual=false] Whether or not to wait for manual cache execution
	 */
	var Cacher = function(theme, options) {
		this.theme = theme;

		options = options || {};

		if (options.events) {
			this.on(options.events);
		}

		if (!options.manual) {
			this.cache();
		}
	};

	_.extend(Cacher.prototype, Backbone.Events);

	Cacher.prototype.model = new Model();


	/**
	 * This function does the actual theme caching
	 *
	 * @api    public
	 * @param {Object} [theme] The theme or error from the getFeed function, where applicable
	 */
	Cacher.prototype.cache = function(theme) {
		// If this is an RSS theme, get the image from the feed first
		if (typeof theme === "undefined" && this.theme.oType === "feed") {
			return this.getFeed(this.cache.bind(this));
		}

		// If theme is false an error occurred in getFeed
		else if (theme === false) {
			this.error();
		}

		// Otherwise, set theme to this.theme
		else if (!theme) {
			theme = this.theme;
		}


		var cached = this.model.get("cached"),
			ids;

		if (cached[theme.id]) {
			// New images might have been added to the theme, so loop
			// through and make sure they're all there. If not, cache them.
			ids = (theme.images || []).filter(function(e) {
				return !cached[e];
			});

			// If this is something like a dynamic theme, inherit information
			// about the current image and the last fetched time
			if (cached[theme.id].currentImage) {
				theme.currentImage = cached[theme.id].currentImage;
			}

			if (cached[theme.id].lastFetched) {
				theme.lastFetched = cached[theme.id].lastFetched;
			}
		}
		else {
			if (theme.images) {
				ids = theme.images.filter(function(e) {
					return !cached[e];
				});
			}
			else {
				ids = [theme.id];
			}
		}


		// If the theme is already cached, cleanup
		if (!ids.length) {
			if (cached[theme.id] && cached[theme.id].image) {
				return this.cleanup(cached[theme.id].image);
			}
			else {
				return this.cleanup();
			}
		}

		var that = this,
			length = ids.length,
			err = this.error.bind(this);

		var isVideo = this.theme.oType === "video";

		FileSystem.get(function(fs) {
			fs.root.getDirectory("Themes", { create: true }, function(dir) {
				var active = 0;

				that.trigger("progress", length, 0);

				ids.forEach(function(id) {
					active++;

					dir.getFile(id + (isVideo ? ".mp4" : ".jpg"), { create: true }, function(fe) {
						var xhr = new XMLHttpRequest();

						xhr.open("GET", (id === theme.id && theme.oType === "feed" ? theme.image : "https://themes.ichro.me/images/" + id + (isVideo ? ".mp4" : ".jpg")));

						xhr.responseType = "blob";

						xhr.onload = function() {
							if (xhr.status !== 200) {
								return err();
							}

							var blob = xhr.response;

							fe.createWriter(function(writer) {
								writer.onwrite = function() {
									active--;

									// This stores the image as a theme
									cached[id] = {
										id: id,
										offline: true
									};

									cached[id][isVideo ? "video" : "image"] = fe.toURL();

									if (active === 0) {
										that.cleanup(cached[id][isVideo ? "video" : "image"]);
									}
									else {
										// length - active might seem to be vulnerable to a race condition at first
										// glance, but the async handlers (dir.getFile) are pushed to the end of the
										// call stack so they can only be called _after_ the forEach is finished
										that.trigger("progress", length, length - active);
									}
								};

								writer.onerror = err;

								writer.write(blob);
							}, err);
						};

						xhr.send();
					}, err);
				});
			}, err);
		}, err);
	};


	/**
	 * The global error handler
	 *
	 * @api    private
	 * @param  {FileError} [e] The FileSystem error, if any
	 */
	Cacher.prototype.error = function(e) {
		// If the FS object has "expired", maybe because of slow
		// requests, restart the caching
		if (e && e.name === "InvalidStateError") {
			return this.cache(this.theme);
		}

		Status.error(e);

		this.trigger("error", e);
	};


	/**
	 * Fetches a theme's RSS feed.  Callable as a standalone function.
	 *
	 * @api    public
	 * @param  {Function} cb      The callback
	 * @param  {Object}   [theme] The theme to fetch, required when called as a standalone function
	 */
	Cacher.prototype.getFeed = function(cb, theme) {
		theme = theme || this.theme;

		// `this` is either a Cacher instance or the Cacher prototype,
		// either way, this.model is defined correctly
		var cached = this.model.get("cached");

		if (cached[theme.id]) {
			theme.image = cached[theme.id].image;

			return cb(theme);
		}

		if (!theme.url || !theme.format) {
			return cb(false);
		}


		var utils = {
				Math: {
					rand: function() {
						return function(max) {
							return Math.floor(Math.random() * max);
						};
					},
					drand: function() {
						return function(max) {
							var rand = Math.sin(new Date().setHours(0, 0, 0, 0)) * 10000;

							return Math.floor((rand - Math.floor(rand)) * max);
						};
					}
				}
			};

		// These are utilities that the URL and image parser are rendered with
		// They can be used to incorporate things like random numbers
		Object.getOwnPropertyNames(Math).forEach(function(e) {
			if (typeof Math[e] === "function") {
				utils.Math[e] = function() {
					return function(args) {
						return Math[e].apply(window, args.split(", "));
					};
				};
			}
			else {
				utils.Math[e] = Math[e];
			}
		});


		$.get(Hogan.compile(theme.url).render(utils), function(d) {
			try {
				var doc;

				if (theme.selector && theme.attr) {
					doc = $(d);

					var url = doc.find(theme.selector);

					if (theme.attr === "text") {
						url = url.text();
					}
					else if (theme.attr === "html") {
						url = url.html();
					}
					else {
						url = url.attr(theme.attr);
					}

					utils.res = url;
				}
				else {
					if (typeof d === "object") {
						utils.res = d;
					}
					else {
						utils.res = JSON.parse(d);
					}
				}

				// Special case handling until a better theme system can be implemented with ServiceWorker
				try {
					if ((theme.id === 82 || theme.id === 83) && utils.res.images && utils.res.images[0] && utils.res.images[0].copyright) {
						theme.currentImage = {
							source: utils.res.images[0].copyrightsource,
							name: utils.res.images[0].copyright.replace(utils.res.images[0].copyrightsource, "").replace(/\(\s*?\)/g, "").trim()
						};
					}
					else if (theme.id === 84 && utils.res.free && utils.res.free[0]) {
						theme.currentImage = {
							name: utils.res.free[0].title,
							source: utils.res.free[0].vendor
						};
					}
					else if (theme.id === 86) {
						theme.currentImage = {
							name: doc.find("item title").text(),
							source: doc.find("item source").text(),
							desc: doc.find("item description").text(),
							url: doc.find("item guid").text()
						};
					}
				}
				catch (e) {}

				theme.image = Hogan.compile(theme.format).render(utils);

				theme.lastFetched = new Date().getTime();

				cb(theme);
			}
			catch(e) {
				Status.error(e);

				cb(false);
			}
		}).fail(function() {
			cb(false);
		});
	};


	/**
	 * Cleans up the theme object, restoring metadata and triggers
	 * the complete event with the newly cached theme
	 *
	 * @api    private
	 * @param  {String} [image] The image (if any) to set on the theme if it
	 *                          doesn't have an images array
	 */
	Cacher.prototype.cleanup = function(image) {
		var theme = this.theme;

		var isVideo = this.theme.oType === "video";

		if (!theme.images && image) {
			theme[isVideo ? "video" : "image"] = image;
		}
		else {
			delete theme.video;
			delete theme.image;
		}

		if (theme.oType) {
			theme.type = theme.oType;

			delete theme.oType;
		}

		theme.offline = true;

		delete theme.size;
		delete theme.stats;
		delete theme.thumb;
		delete theme.original;
		delete theme.resolution;
		delete theme.categories;
		delete theme.filterCategories;

		this.model.storage.cached[theme.id] = theme;

		this.model.set("cached", this.model.storage.cached);

		this.model.storage.sync();

		this.trigger("complete", theme);
	};


	Cacher.Custom = {
		/**
		 * Caches a custom theme's image by URL, saves the theme and returns
		 * the newly saved theme object
		 *
		 * @api    public
		 * @param  {Object}   theme The theme to save
		 * @param  {Number}   id    The ID to save the theme under
		 * @param  {Function} cb    The callback
		 */
		cache: function(theme, id, cb) {
			// If the theme doesn't need any caching, delete the old image if present and return
			if (theme.image.indexOf("data:") === 0 || theme.image.indexOf("filesystem:") === 0 || theme.image.indexOf("/") === 0) {
				theme.offline = true;

				this.deleteImage(theme.id, function() {
					cb(theme);
				});

				return;
			}


			var err = function(e) {
				if (e && e.name === "InvalidStateError") {
					return this.cache(theme, id, cb);
				}

				theme.image = false;

				cb(theme);
			}.bind(this);


			var url = theme.image.parseUrl(),
				ext = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);

			if (ext && ext[1] && !ext[1].match(/^(jpg|png|gif|svg|webp|bmp)$/i)) {
				err();
			}

			FileSystem.get(function(fs) {
				fs.root.getDirectory("Themes", { create: true }, function(tDir) {
					tDir.getDirectory("Custom", { create: true }, function(dir) {
						dir.getFile(id, { create: true }, function(fe) {
							var xhr = new XMLHttpRequest();

							xhr.open("GET", url);

							xhr.responseType = "blob";

							xhr.onload = function() {
								if (xhr.status !== 200) {
									return err();
								}

								var blob = xhr.response;

								fe.createWriter(function(writer) {
									writer.onwrite = function() {
										theme.image = fe.toURL() + "#OrigURL:" + url;

										theme.offline = true;

										cb(theme);
									};

									writer.onerror = err;

									writer.write(blob);
								}, err);
							};

							xhr.send();
						}, err);
					}, err);
				}, err);
			}, err);
		},


		/**
		 * Deletes a theme and it's image and re-enumerates the remaining themes
		 *
		 * @api    public
		 * @param  {Number}   id    The ID of the theme to delete
		 * @param  {Function} cb    The callback
		 */
		delete: function(id, cb) {
			this.deleteImage(id, function() {
				this.reEnumerate(id, function() {
					Cacher.prototype.model.storage.themes.splice(id, 1);

					Cacher.prototype.model.set("custom", Cacher.prototype.model.storage.themes);

					Cacher.prototype.model.storage.sync();

					cb();
				}.bind(this));
			}.bind(this));
		},


		/**
		 * Re-enumerates the saved images of custom themes to match their index
		 *
		 * @api    public
		 * @param  {Number}   id The ID of the theme to re-enumerate from
		 * @param  {Function} cb The callback
		 */
		reEnumerate: function(id, cb) {
			var err = function(e) {
					if (e && e.name === "InvalidStateError") {
						return this.reEnumerate(id, cb);
					}

					cb();
				}.bind(this),
				themes = Cacher.prototype.model.get("custom");

			FileSystem.get(function(fs) {
				fs.root.getDirectory("Themes", { create: true }, function(tDir) {
					tDir.getDirectory("Custom", { create: true }, function(dir) {
						var entries = [],
							rename = function() {
								var length = entries.length,
									done = 0;

								entries.forEach(function(e) {
									var nName = parseInt(e.name);

									if (typeof nName !== "undefined" && nName > id && themes[nName] && (nName + "").length === e.name.length) { // The theme name is just a number
										e.moveTo(dir, nName - 1, function(fe) {
											var oURL = themes[nName].image.split("#OrigURL:")[1];

											themes[nName].image = fe.toURL() + (oURL ? "#OrigURL:" + oURL : "");

											done++;

											if (done === length) {
												cb();
											}
										});
									}
									else {
										done++;

										if (done === length) {
											cb();
										}
									}
								});
							},
							reader = dir.createReader();

						(function read() { // Recursive and self executing, necessary as per the specs
							reader.readEntries(function(results) {
								if (!results.length) {
									entries.sort(function(a, b) {
										return a.name < b.name ? -1 : a.name > b.name; // 400x faster than localeCompare
									});

									rename();
								}
								else {
									entries = entries.concat(Array.prototype.slice.call(results, 0));

									read();
								}
							}, err);
						})();
					}, err);
				}, err);
			}, err);
		},


		/**
		 * Saves a theme's uploaded image, along with the theme and returns the newly saved theme object
		 *
		 * @api    public
		 * @param  {Object}   theme The theme to save
		 * @param  {File}     file  The uploaded file
		 * @param  {Number}   id    The ID to save the theme under
		 * @param  {Function} cb    The callback
		 */
		saveUpload: function(theme, file, id, cb) {
			var err = function(e) {
				if (e && e.name === "InvalidStateError") {
					return this.saveUpload(theme, file, id, cb);
				}

				theme.image = false;

				cb(theme);
			}.bind(this);

			FileSystem.get(function(fs) {
				fs.root.getDirectory("Themes", { create: true }, function(tDir) {
					tDir.getDirectory("Custom", { create: true }, function(dir) {
						dir.getFile(id, { create: true }, function(fe) {
							fe.createWriter(function(writer) {
								writer.onwrite = function() {
									theme.image = fe.toURL();

									theme.offline = true;

									cb(theme);
								};

								writer.onerror = err;

								writer.write(file);
							}, err);
						}, err);
					}, err);
				}, err);
			}, err);
		},


		/**
		 * Deletes a themes previous image
		 *
		 * @api    public
		 * @param  {Number}   id The ID of the theme to delete the image from
		 * @param  {Function} cb The callback
		 */
		deleteImage: function(id, cb) {
			var err = function(e) {
				if (e && e.name === "InvalidStateError") {
					return this.deleteImage(id, cb);
				}

				cb();
			}.bind(this);

			FileSystem.get(function(fs) {
				fs.root.getDirectory("Themes", { create: true }, function(tDir) {
					tDir.getDirectory("Custom", { create: true }, function(dir) {
						dir.getFile(id, { create: false }, function(fe) {
							fe.remove(cb, err);
						}, err);
					}, err);
				}, err);
			}, err);
		}
	};

	return Cacher;
});