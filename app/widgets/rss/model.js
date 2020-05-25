define(["lodash", "jquery", "widgets/model", "lib/parseurl", "lib/feedlyproxy"], function(_, $, WidgetModel, parseUrl, feedlyProxy) {
	return WidgetModel.extend({
		widgetClassname: "tabbed-corner refreshable",

		refreshInterval: 60000,

		pro_tooltip: "rss",

		defaults: {
			config: {
				title: "Lifehacker",
				link: "",
				number: 5,
				cache: 5,
				view: "default",
				images: "true",
				desc: "true",
				size: "variable",
				feeds: [
					{
						url:  "https://lifehacker.com/rss",
						name: "Lifehacker"
					}
				]
			},

			data: {
				items: [
					{
						title: "Pandora for iOS has gained a nifty feature today: the app can act as an alarm clock so you can wake",
						url: "http://feeds.gawker.com/~r/lifehacker/full/~3/p-3zc3sNwyQ/pandora-for-ios-has-gained-a-nifty-feature-today-the-a-1479529870",
						desc: "Pandora for iOS has gained a nifty feature today: the app can act as an alarm clock so you can wake up to some music. Read more on the Pandora blog.Read more..."
					},
					{
						title: "Surfly Shares Your Browsing Session Without Downloading Anything",
						url: "http://feeds.gawker.com/~r/lifehacker/full/~3/TD7FbdZCHHk/surfly-shares-your-browsing-session-without-downloading-1479358895",
						image: "http://img.gawkerassets.com/img/198vaoqj1h8yspng/ku-medium.png",
						desc: "Sometimes, it's just easier to show someone what you're doing instead of explaining yourself. Over the web, that can be difficult, but Surfly makes it a bit easier.Read more..."
					},
					{
						title: "Design Your Home Bar with Ergonomics (and Guests) In Mind",
						url: "http://feeds.gawker.com/~r/lifehacker/full/~3/fT1J5LvVCBg/design-your-home-bar-with-ergonomics-and-guests-in-mi-1479090750",
						image: "http://img.gawkerassets.com/img/198s8jxvaur33jpg/small.jpg",
						desc: "If you're putting together a home bar, you're probably thinking about the essentials you'll need, but not necessarily how it's laid out and where in the room. Kevin Liu at Serious Eats suggests you think about positioning too—the right layout will ke"
					},
					{
						title: "Gawker Paris Hilton's Brother Bloodied in Attack Ordered By Lindsay Lohan | io9 Scientists listened",
						url: "http://feeds.gawker.com/~r/lifehacker/full/~3/QMRqfH-YUcA/@whitsongordon",
						desc: "Gawker Paris Hilton's Brother Bloodied in Attack Ordered By Lindsay Lohan | io9 Scientists listened to the heartbeat of a prisoner as he was executed | Jalopnik Comedian Dares To Make Fun Of Danica Patrick, Awkwardness Ensues | Jezebel No One Learns "
					},
					{
						title: "4 Unconventional Ways the Internet Can Help You Land Job",
						url: "http://feeds.gawker.com/~r/lifehacker/full/~3/B6gKevxTg3k/4-unconventional-ways-the-internet-can-help-you-land-jo-1479206108",
						image: "http://img.gawkerassets.com/img/198uydw1d3z7djpg/small.jpg",
						desc: "With thousands of new people entering the job market daily, you need to tap every available resource to stand out. The internet can help you hack into the minds of potential employers, if you know where to look.Read more..."
					}
				]
			}
		},


		/**
		 * Initialize
		 *
		 * The RSS widget supports a list of feeds (for Pro users), but only
		 * caches entries from the first and default one.
		 */
		initialize: function() {
			if (this.config.view) {
				delete this.config.view;
			}

			// Migrate pre-V2 feeds to the new format
			if (!this.config.feeds && this.config.url) {
				this.config.feeds = [{
					url: this.config.url,
					name: this.config.title
				}];

				delete this.config.url;

				this.saveConfig();
			}
			else {
				//Migrate to new default settings
				var isUpdated = false;
				if (this.config.feeds) {
					this.config.feeds.forEach(function(e) {
						if (e.url === "http://feeds.gawker.com/lifehacker/full") {
							e.url = "https://lifehacker.com/rss";
							isUpdated = true;
						}
					});
				}

				if (this.config.url) {
					delete this.config.url;
					isUpdated = true;
				}

				if (isUpdated) {
					this.saveConfig();
				}
			}

			this.set("activeTab", 0);

			this.on("change", function(model, options) {
				if (options && options.widgetChange === true) {
					return;
				}

				this.refresh();
			}, this);
		},


		/**
		 * Parses a feed entry, removing tracking tokens, ads, and sharing buttons
		 *
		 * @param   {Object}   e           The item to parse
		 * @param   {Boolean}  [extended]  If extended data should be parsed
		 * @return  {Object}               A parsed, normalized entry
		 */
		parseEntry: function(e, extended) {
			extended = extended === true;

			var html = $("<div>" + ((e.summary && e.summary.content) || (e.content && e.content.content) || "")
				.replace(/ src="\/\//g, " data-src=\"https://")
				.replace(/ src="/g, " data-src=\"")
				.replace(/ src='\/\//g, " data-src='https://")
				.replace(/ src='/g, " data-src='") +
			"</div>");

			// Cleanup tracking images, feedburner ads, etc.
			_.each(html[0].querySelectorAll('.mf-viral, .feedflare, img[width="1"], img[height="1"], img[data-src^="http://da.feedsportal.com"]'), function(e) {
				if (e && e.parentNode) {
					e.parentNode.removeChild(e);
				}
			});


			var item = {
				date: e.published,
				title: (e.title || "").trim(),
				url: ((_.find(e.alternate, { type: "text/html" }) || {}).href || "").trim()
			};


			if (extended) {
				item.author = e.author;
				item.source = e.origin && e.origin.title;
			}


			if (e.visual && e.visual.url && e.visual.url !== "none") {
				item.image = e.visual.url;
			}
			else if (html.find("img[data-src]").length) {
				item.image = html.find("img[data-src]").first().attr("data-src");
			}
			else if (html.find("iframe[data-chomp-id]").length) {
				item.image = "http://img.youtube.com/vi/" + html.find("iframe[data-chomp-id]").attr("data-chomp-id") + "/1.jpg";
			}
			else if (e.enclosure && e.enclosure.length > 0 && e.enclosure[0].width && e.enclosure[0].height && e.enclosure[0].href) {
				item.image = e.enclosure[0].href;
			}


			// Find any element that isn't allowed and replace it with its contents
			_.each(html[0].querySelectorAll("*:not(a):not(b):not(i):not(strong):not(u)"), function(e) {
				if (e.children.length) {
					$(e).children().unwrap();
				}
				else {
					$(e).replaceWith(e.innerHTML);
				}
			});

			// Then remove anything that's left
			_.each(html[0].querySelectorAll("*:not(a):not(b):not(i):not(strong):not(u)"), function(e) {
				if (e && e.parentNode) {
					e.parentNode.removeChild(e);
				}
			});


			// If the first element in the description is empty or the article's
			// title repeated, remove it
			var fChild = html.children().first(),
				text = (fChild.text() || "").trim();

			if (!text || text.toLowerCase() === item.title.toLowerCase()) {
				fChild.remove();
			}


			// If the description is blank (maybe it only had an image that's now
			// been removed), remove it
			if (!html[0].innerHTML.trim().length) {
				delete item.desc;
			}

			// Otherwise, make every link nested so it can still be clicked
			else {
				_.each(html[0].querySelectorAll("a"), function(e) {
					var span = document.createElement("span");

					span.setAttribute("class", "nested-link");
					span.setAttribute("data-target", "blank");
					span.setAttribute("class", "nested-link");

					span.textContent = e.textContent.replace(/\n/g, "  ").trim();


					var href = e.getAttribute("href") || "http://www.google.com/";

					if (href.trim().indexOf("//") === 0) {
						href =  "http:" + href.trim();
					}
					else if (href.trim().indexOf("http") !== 0) {
						href =  "http://" + href.trim();
					}
					else {
						href = href.trim();
					}

					span.setAttribute("data-href", href);


					$(e).replaceWith(span);
				});

				item.desc = html[0].innerHTML.trim();
			}

			return item;
		},


		/**
		 * Fetches all articles from all feeds, emitting the 45 newest
		 */
		getAll: function(isReload) {
			var feeds = _.uniq(_.map(this.config.feeds, function(e) {
				return parseUrl(e.url || "https://lifehacker.com/rss");
			}));

			if (!feeds.length) {
				feeds = [this.config.url || "https://lifehacker.com/rss"];
			}

			var numPerFeed = Math.round((45 / feeds.length) * 2);

			function loadFeed(feed) {
				return function() {
					return $.getJSON("https://cloud.feedly.com/v3/streams/contents?count=" + numPerFeed + "&nocache=" + (new Date().getTime()) + "&streamId=feed%2F" + encodeURIComponent(feed));
				};
			}

			var processResult = function (results, errors) {
				if (this.get("activeTab") !== "all") {
					return;
				}

				var entries = _(results)
					.map(function(d) {
						return (d && d.items) || [];
					})
					.flatten()
					.sortByOrder("published", "desc")
					.take(45)
					.map(_.bind(this.parseEntry, this, _, true))
					.value();

				this.trigger("entries:loaded", {
					items: entries,
					errors: errors
				});
			}.bind(this);

			var delay = function(timeout){
				var $d = $.Deferred(),
					t = timeout || 0;
				  
				setTimeout(function (){
				  $d.resolve(timeout);
				}, t);

				return function() {
					return $d.promise();
				};
			};

			var errorCount = 0;
			var result = [];
			var cacheTimeout = (this.config.cache === '' ? 5 : this.config.cache) * 60000;
			feeds.reduce(function(prevFeed, feed) {
				var cached = feedlyProxy.getCached(feed);
				if (cached && !isReload) {
					return prevFeed
						.then(function() {
							result.push(cached);
						})
						.done(function (){
							if (feed === feeds[feeds.length - 1]) { 
								processResult(result, errorCount); //Last feed received or failed
							}
						});
				}

				return prevFeed
					.then(loadFeed(feed))
					.then(function(data) {
						feedlyProxy.onsent(data, feed, new Date().getTime() + cacheTimeout);
						result.push(data);
					})
					.fail(function() {
						errorCount++;
					})
					.done(function (){
						if (feed === feeds[feeds.length - 1]) { 
							processResult(result, errorCount); //Last feed received or failed
						}
					})
					.then(delay(1000));
			}, $.when());
		},


		refresh: function(isReload) {
			// We save the active feed in case it changes before the request is finished
			var activeTab = this.get("activeTab");

			if (!this.Auth.isPro && activeTab !== 0) {
				return this.set("activeTab", 0);
			}

			if (this.config.feeds && activeTab >= this.config.feeds.length) {
				//The active tab is deleted in the settings
				return this.set("activeTab", 0);
			}

			if (activeTab === "all") {
				return this.getAll(isReload);
			}

			var feed = (this.config.feeds && this.config.feeds[activeTab].url) || this.config.url || "https://lifehacker.com/rss";

			var maximized = this.get("state") === "maximized";

			var feedUrl = "https://cloud.feedly.com/v3/streams/contents?count=" + (maximized || this.config.number === '' ? 45 : this.config.number) + "&nocache=" + (new Date().getTime()) + "&streamId=feed%2F" + encodeURIComponent(parseUrl(feed));

			var delayMs = feedlyProxy.getDelay(isReload || false);
			if (delayMs >= 0) {
				this.getSingle(feedUrl, feed, isReload);
				return;
			}

			setTimeout(function() {
				this.getSingle(feedUrl, feed, isReload);
			}.bind(this), delayMs);
		},

		getSingle: function(url, feed, isReload) {
			var activeTab = this.get("activeTab");
			var maximized = this.get("state") === "maximized";

			var process = function(d) {
				// If the active feed has changed (i.e. the user has switched tabs
				// twice before the request finished), we don't want to emit any entries
				if (d && d.items && this.get("activeTab") === activeTab) {
					var items = _.map(d.items, this.parseEntry, this);

					// Only save data if this is the first feed and we aren't
					// maximized (and therefore didn't fetch more articles)
					if (!activeTab && !maximized) {
						this.saveData({
							items: items
						});
					}
					else {
						// We only trigger the entries:loaded event if this is not the
						// first feed so the view doesn't render twice
						this.trigger("entries:loaded", {
							items: items,
							errors: 0
						});
					}
				}
			}.bind(this);

			var cached = feedlyProxy.getCached(feed);
			if (cached && !isReload) {
				process(cached);
				return;
			}

			var cacheTimeout = (this.config.cache === '' ? 5 : this.config.cache) * 60000;

			// Switch to /v3/mixes/contents to get the most popular entries instead of the newest
			$.getJSON(url, function(d) {
				feedlyProxy.onsent(d, feed, new Date().getTime() + cacheTimeout);
				process(d);
			}.bind(this)).fail(function() {
				this.trigger("entries:loaded", {
					errors: 1
				});
			});
		}
	});
});