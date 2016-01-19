/**
 * This module handles theme changes from incoming sync data
 */
define(["jquery", "lodash", "browser/api"], function($, _, Browser) {
	// The cacher depends on storage, so we need to load it at run time
	var Cacher;

	/**
	 * Checks for theme changes, saving any themes that aren't present in the local cache.
	 *
	 * @api     private
	 * @param   {Storage}   storage
	 * @param   {Object}    d        The incoming sync object
	 * @param   {Function}  cb
	 */
	var updateThemes = function(storage, d, cb) {
		var oldData = _.pick(storage, "user", "tabs", "themes", "settings");

		var newData = _.pick(d, "user", "tabs", "themes", "settings");

		var themesChanged = newData.themes && (JSON.stringify(oldData.themes) !== JSON.stringify(newData.themes));

		var save = function() {
			var queue = [];

			if (newData.settings && newData.settings.theme && parseInt(newData.settings.theme) && !storage.cached[newData.settings.theme]) {
				queue.push(newData.settings.theme);
			}

			var next = function() {
				if (queue.length) {
					var theme = mThemes[queue.pop()];

					return new Cacher(theme, {
						events: {
							complete: next
						}
					});
				}

				var save = function() {
					newData.cached = storage.cached;

					cb(newData);
				};

				if (themesChanged) {
					// Any combination of changes could've happened, delete and recache everything

					var cacheNew = function() {
						if (newData.themes.length) {
							queue = _.map(newData.themes, function(e, i) {
								if (!e.image || (e.image.indexOf("#OrigURL:") === -1 && e.image.indexOf("http") !== 0)) {
									return function() {
										if (queue.length) {
											return queue.pop()();
										}

										save();
									};
								}

								if (e.image.indexOf("#OrigURL:") !== -1) {
									e.image = e.image.split("#OrigURL:")[1];
								}

								return function() {
									Cacher.Custom.cache(e, i, function() {
										if (queue.length) {
											return queue.pop()();
										}

										save();
									});
								};
							});

							queue.pop()();
						}
						else {
							save();
						}
					};


					if (oldData.themes.length) {
						queue = _.map(oldData.themes , function(e, i) {
							return function() {
								Cacher.Custom.deleteImage(i, function() {
									if (queue.length) {
										return queue.pop()();
									}

									cacheNew();
								});
							};
						});

						queue.pop()();
					}
					else {
						cacheNew();
					}
				}
				else {
					save();
				}
			};

			var mThemes;

			if (queue.length) {
				$.get("https://api.ichro.me/themes?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language, function(d) {
					if (d && d.themes) {
						mThemes = _.indexBy(_.map(d.themes, function(e) {
							e.oType = e.type;

							return e;
						}), "id");

						next();
					}
				});
			}
			else {
				next();
			}
		};

		if (themesChanged || (JSON.stringify(newData) !== JSON.stringify(oldData))) {
			save();
		}
	};


	/**
	 * Wraps the method and ensures that the themes cacher is always available
	 *
	 * @api     public
	 */
	return function() {
		if (Cacher) {
			updateThemes.apply(this, arguments);
		}
		else {
			var that = this,
				args = arguments;

			require(["themes/cacher"], function(cacher) {
				Cacher = cacher;

				updateThemes.apply(that, args);
			});
		}
	};
});