/*
 * The Youtube widget.
 */
define(["lodash", "jquery", "moment"], function(_, $, moment) {
	var abbreviate = function(num, min, precision) {
		var newValue = num;

		min = min || 1000;
		precision = precision || 3;

		if (num >= min) {
			var suffixes = ["", "K", "M", "B","T"],
				suffixNum = Math.floor((("" + parseInt(num)).length - 1) / 3),
				shortValue = "";

			for (var length = precision; length >= 1; length--) {
				shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(length));

				var dotLessShortValue = (shortValue + "").replace(/[^A-z0-9 ]+/g, "");

				if (dotLessShortValue.length <= precision) {
					break;
				}
			}

			if (shortValue % 1 !== 0) {
				shortValue = shortValue.toFixed(1);
			}

			newValue = shortValue + suffixes[suffixNum];
		}
		else {
			newValue = newValue.toLocaleString();
		}

		return newValue;
	};

	return {
		id: 29,
		sort: 300,
		size: 6,
		order: 18,
		interval: 300000,
		nicename: "youtube",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "select",
				nicename: "view",
				label: "i18n.settings.format",
				options: {
					large: "i18n.settings.format_options.large",
					large_2: "i18n.settings.format_options.large_2",
					large_4: "i18n.settings.format_options.large_4",
					four: "i18n.settings.format_options.four",
					six: "i18n.settings.format_options.six",
				}
			},
			{
				type: "text",
				nicename: "user",
				label: "i18n.settings.from",
				help: "i18n.settings.from_help",
				placeholder: "i18n.settings.from_placeholder"
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
			view: "large_2",
			target: "_self",
			user: ""
		},
		data: {
			videos: [
				{
					title: "Underwater ecosystem | DEMO",
					url: "#",
					uploader: "DEMO",
					duration: "2:07",
					thumb: "https://ichro.me/img/youtube/coral.jpg",
					views: 1143620
				},
				{
					title: "Mars polar ice caps | DEMO",
					url: "#",
					views: 2980000,
					uploader: "DEMO",
					duration: "2:18",
					thumb: "https://ichro.me/img/youtube/mars.jpg"
				},
				{
					title: "The giant panda | DEMO",
					url: "#",
					views: 790000,
					uploader: "DEMO",
					duration: "5:04",
					thumb: "https://ichro.me/img/youtube/panda.jpg"
				},
				{
					title: "Sugar has been around for well over 10k years | DEMO",
					url: "#",
					views: 714000,
					uploader: "DEMO",
					duration: "3:41",
					thumb: "https://ichro.me/img/youtube/sugar.jpg"
				},
				{
					title: "Largest living cat species | DEMO",
					url: "#",
					views: 368000,
					uploader: "DEMO",
					duration: "3:34",
					thumb: "https://ichro.me/img/youtube/tiger.jpg"
				}
			]
		},
		resetChannelSettings: function() {
			delete this.config.resolvedId;
			delete this.config.resolvedUser;
			this.config.user = "";
			this.refresh();
		},
		//apiKey: "AIzaSyBWWt5WxgH6uX2Q39CkPdJqm4RVIPidJeo",
		apiKey: "__API_KEY_youtube__",
		refresh: function() {
			var that = this;

			var url = "https://www.googleapis.com/youtube/v3/";

			if (this.config.user && this.config.user.trim() !== "") {
				if (!this.config.resolvedId || this.config.resolvedUser !== this.config.user) {
					return $.get(url + "channels?part=contentDetails&forUsername=" + encodeURIComponent(this.config.user) + "&fields=items/contentDetails/relatedPlaylists/uploads&maxResults=1&key=" + this.apiKey, function(d) {						
						try {
							this.config.resolvedId = d.items[0].contentDetails.relatedPlaylists.uploads;
							this.config.resolvedUser = this.config.user;
							this.refresh();
							return;
						}
						catch (e) {
							//Try to search
						}

						return $.get(url + "search?part=id&maxResults=1&q=" + encodeURIComponent(this.config.user) + "&type=channel&&fields=items/id&key=" + this.apiKey, function(c) {						
							var channelId = '';
							try
							{
								channelId = c.items[0].id.channelId;
							}
							catch (e) {
								this.resetChannelSettings();
								return;
							}

							return $.get(url + "channels?part=contentDetails&id=" + channelId + "&fields=items/contentDetails/relatedPlaylists/uploads&maxResults=1&key="  + this.apiKey, function(d2) {
								try {
									this.config.resolvedId = d2.items[0].contentDetails.relatedPlaylists.uploads;
									this.config.resolvedUser = this.config.user;
									this.refresh();
								}
								catch (e) {
									this.resetChannelSettings();
								}
							}.bind(this));								
						}.bind(this));								
					}.bind(this));
				}

				url += "playlistItems?playlistId=" + encodeURIComponent(this.config.resolvedId) + "&part=snippet&fields=items(id,snippet(title,description,thumbnails/high/url,resourceId/videoId,channelTitle))";
			}
			else {
				url += "videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=us&fields=items(id,snippet(title,description,thumbnails/high/url,channelTitle),statistics/viewCount,contentDetails/duration)";
			}

			//url += "&maxResults=6&key=__API_KEY_youtube__";
			url += "&maxResults=6&key="  + this.apiKey;


			$.get(url, function(d) {
				if (d && d.items && d.items.length) {
					var videos = d.items.map(function(e) {
						var d = e.contentDetails && e.contentDetails.duration && moment.duration(e.contentDetails.duration);

						return {
							title: e.snippet.title,
							uploader: e.snippet.channelTitle,
							description: e.snippet.description,
							views: parseInt((e.statistics && e.statistics.viewCount) || 0),
							thumb: (e.snippet && e.snippet.thumbnails && e.snippet.thumbnails.high && e.snippet.thumbnails.high.url) || "",
							duration: (d ? (d.hours() ? d.hours() + ":" + _.padLeft(d.minutes(), 2, "0") : d.minutes()) + ":" + _.padLeft(d.seconds(), 2, "0") : "0:00"),
							url: "https://www.youtube.com/watch?v=" + encodeURIComponent((e.snippet && e.snippet.resourceId && e.snippet.resourceId.videoId) || e.id)
						};
					});

					that.data = {
						videos: videos
					};

					that.utils.saveData(that.data);

					that.render.call(that);
				}
			});
		},
		render: function() {
			var data = $.extend(true, {}, this.data);

			switch (this.config.view) {
				case "large":
					data.featured = data.videos.shift();

					delete data.videos;
				break;
				case "large_2":
					data.featured = data.videos.shift();

					data.videos.splice(2);
				break;
				case "large_4":
					data.featured = data.videos.shift();

					data.videos.splice(4);
				break;
				case "four":
					data.videos.splice(4);
				break;
				case "six":
					data.videos.splice(6);
				break;
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (data.featured) {
				data.featured.views = data.featured.views.toLocaleString();
			}

			if (data.videos) {
				data.videos.forEach(function(e) {
					e.views = abbreviate(e.views);
				});
			}

			data.newTab = this.config.target === "_blank";

			this.utils.render(data);
		}
	};
});