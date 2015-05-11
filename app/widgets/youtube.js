/*
 * The Youtube widget.
 */
define(["jquery", "moment"], function($, moment) {
	return {
		id: 29,
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
					title: "Official Extended Trailer | GOTHAM | FOX BROADCASTING",
					url: "http://www.youtube.com/watch?v=0d1zpt6k5OI&feature=youtube_gdata",
					uploader: "FOX",
					duration: "2:07",
					thumb: "http://i1.ytimg.com/vi/0d1zpt6k5OI/0.jpg",
					views: 1143620
				},
				{
					title: "Rick Grimes vs Walter White.  Epic Rap Battles of History Season 3.",
					url: "http://www.youtube.com/watch?v=krQHQvtIr6w&feature=youtube_gdata",
					views: 2980000,
					uploader: "ERB",
					duration: "2:18",
					thumb: "http://i1.ytimg.com/vi/krQHQvtIr6w/0.jpg"
				},
				{
					title: "Usher - Good Kisser",
					url: "http://www.youtube.com/watch?v=1lQtoRFaLsA&feature=youtube_gdata",
					views: 790000,
					uploader: "UsherVEVO",
					duration: "5:04",
					thumb: "http://i1.ytimg.com/vi/1lQtoRFaLsA/0.jpg"
				},
				{
					title: "Linkin Park - \"Until It's Gone\" [Official Lyric Video]",
					url: "http://www.youtube.com/watch?v=Nym1P-BO_ws&feature=youtube_gdata",
					views: 714000,
					uploader: "Linkin Park",
					duration: "3:41",
					thumb: "http://i1.ytimg.com/vi/Nym1P-BO_ws/0.jpg"
				},
				{
					title: "Internet Citizens: Defend Net Neutrality",
					url: "http://www.youtube.com/watch?v=wtt2aSV8wdw&feature=youtube_gdata",
					views: 368000,
					uploader: "CGP Grey",
					duration: "3:34",
					thumb: "http://i1.ytimg.com/vi/wtt2aSV8wdw/0.jpg"
				}
			]
		},
		refresh: function() {
			var that = this;

			var url = "https://www.googleapis.com/youtube/v3/";

			if (this.config.user && this.config.user.trim() !== "") {
				if (!this.config.resolvedId || this.config.resolvedUser !== this.config.user) {
					return $.get(url + "channels?part=contentDetails&forUsername=" + encodeURIComponent(this.config.user) + "&fields=items/contentDetails/relatedPlaylists/uploads&maxResults=1&key=__API_KEY_youtube__", function(d) {
						try {
							this.config.resolvedId = d.items[0].contentDetails.relatedPlaylists.uploads;

							this.config.resolvedUser = this.config.user;
						}
						catch (e) {
							delete this.config.resolvedId;

							delete this.config.resolvedUser;

							this.config.user = "";
						}

						this.refresh();
					}.bind(this));
				}
				
				url += "playlistItems?playlistId=" + encodeURIComponent(this.config.resolvedId) + "&part=snippet&fields=items(id,snippet(title,description,thumbnails/high/url,resourceId/videoId,channelTitle))";
			}
			else {
				url += "videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=us&fields=items(id,snippet(title,description,thumbnails/high/url,channelTitle),statistics/viewCount,contentDetails/duration)";
			}

			url += "&maxResults=6&key=__API_KEY_youtube__";


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
							duration: (d ? (d.hours() ? d.hours() + ":" + d.minutes().pad() : d.minutes()) + ":" + d.seconds().pad() : "0:00"),
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
					e.views = e.views.abbr();
				});
			}

			data.newTab = this.config.target == "_blank";

			this.utils.render(data);
		}
	};
});