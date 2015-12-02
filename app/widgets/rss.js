/*
 * The RSS widget.
 */
define(["jquery", "lodash"], function($, _) {
	return {
		id: 8,
		size: 5,
		order: 3,
		interval: 300000,
		nicename: "rss",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "text",
				nicename: "link",
				label: "i18n.settings.link",
				placeholder: "i18n.settings.link_placeholder"
			},
			{
				type: "text",
				nicename: "url",
				label: "i18n.settings.url",
				placeholder: "i18n.settings.url_placeholder"
			},
			{
				type: "number",
				nicename: "number",
				label: "i18n.settings.articles",
				min: 1,
				max: 20
			},
			{
				type: "select",
				nicename: "view",
				label: "i18n.settings.view",
				options: {
					images: "i18n.settings.view_options.images",
					"default": "i18n.settings.view_options.default"
				}
			},
			{
				type: "radio",
				nicename: "images",
				label: "i18n.settings.images",
				options: {
					"true": "i18n.settings.on",
					"false": "i18n.settings.off"
				}
			},
			{
				type: "radio",
				nicename: "desc",
				label: "i18n.settings.descriptions",
				options: {
					"true": "i18n.settings.on",
					"false": "i18n.settings.off"
				}
			}
		],
		config: {
			title: "Lifehacker",
			link: "",
			number: 5,
			view: "default",
			images: "true",
			desc: "true",
			size: "variable",
			url: "http://feeds.gawker.com/lifehacker/full"
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
		},
		
		/**
		 * Parses a feed entry, removing tracking tokens, ads, and sharing buttons
		 *
		 * @param   {Object}   e           The item to parse
		 * @return  {Object}               A parsed, normalized entry
		 */
		parseEntry: function(e) {
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
				title: (e.title || "").trim(),
				url: ((_.find(e.alternate, { type: "text/html" }) || {}).href || "").trim()
			};


			if (e.visual && e.visual.url && e.visual.url !== "none") {
				item.image = e.visual.url;
			}
			else if (html.find("img[data-src]").length) {
				item.image = html.find("img[data-src]").first().attr("data-src");
			}
			else if (html.find("iframe[data-chomp-id]").length) {
				item.image = "http://img.youtube.com/vi/" + html.find("iframe[data-chomp-id]").attr("data-chomp-id") + "/1.jpg";
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

			if (!text || text.toLowerCase() == item.title.toLowerCase()) {
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

					span.innerText = e.innerText.replace(/\n/g, "  ").trim();


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

		refresh: function() {
			var url = this.config.url;

			if (!url) {
				url = "http://feeds.gawker.com/lifehacker/full";
			}
			else {
				url = url.parseUrl();
			}

			$.getJSON("http://cloud.feedly.com/v3/streams/contents?count=" + this.config.number + "&streamId=feed%2F" + encodeURIComponent(url), function(d) {
				if (d && d.items) {
					this.data = {
						items: _.map(d.items, this.parseEntry, this)
					};

					this.render.call(this);

					this.utils.saveData(this.data);
				}
				else {
					alert(this.utils.translate("feed_error", url));
				}
			}.bind(this));
		},
		render: function() {
			var rss = $.extend(true, {}, this.data || {items:[]});

			rss.items = rss.items.slice(0, this.config.number || 5);

			for (var i = rss.items.length - 1; i >= 0; i--) {
				if (this.config.desc == "false" && rss.items[i].desc) {
					delete rss.items[i].desc;
				}

				if (this.config.images == "false" && rss.items[i].image) {
					delete rss.items[i].image;
				}
			}

			if (this.config.title && this.config.title !== "") {
				rss.title = this.config.title;
			}

			if (this.config.link && this.config.link !== "") {
				rss.link = this.config.link.parseUrl();
			}

			if (this.config.view && this.config.view == "images") {
				rss.images = true;
			}

			this.utils.render(rss);

			if (rss.images) {
				this.elm.find("img").on("error", function(e) {
					this.style.height = "20px";
				});
			}
		}
	};
});