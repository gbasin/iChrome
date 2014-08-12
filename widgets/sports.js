/*
 * The Sports widget.
 */
define(["jquery"], function($) {
	return {
		id: 15,
		nicename: "sports",
		sizes: ["tiny", "variable"],
		interval: 180000,
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide",
				sizes: ["variable"]
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "league",
				label: "League",
				options: {
					nfl: "NFL",
					mlb: "MLB",
					nba: "NBA",
					nhl: "NHL",
					ncaaf: "NCAA Football"
				}
			},
			{
				type: "number",
				nicename: "number",
				label: "Games Shown",
				min: 1,
				max: 10,
				sizes: ["variable"]
			},
			{
				type: "select",
				nicename: "team",
				label: "Team",
				options: "getTeams",
				chained: "league",
				sizes: ["tiny"]
			},
			{
				type: "select",
				nicename: "teams",
				label: "Teams",
				options: "getTeams",
				multiple: true,
				chained: "league",
				sizes: ["variable"]
			},
			{
				type: "radio",
				nicename: "unavailable",
				label: "When team games are unavailable",
				options: {
					other: "Show other games",
					none: "Show \"No Games\""
				}
			}
		],
		config: {
			title: "NFL Games",
			size: "variable",
			league: "nfl",
			teams: [],
			number: 5,
			unavailable: "other"
		},
		data: {
			games: [
				{
					home_first: "San Francisco",
					home_last: "49ers",
					home_id: "nfl/sfo",
					away_first: "Atlanta",
					away_last: "Falcons",
					away_id: "nfl/atl",
					start: 1387849200000,
					status: "Today, 8:40 PM<br />ESPN",
					label: "8:40 pm ET",
					coverage: "ESPN",
					link: "http://sports.yahoo.com/nfl/atlanta-falcons-san-francisco-49ers-20131223025/",
					time: "Today, 8:40 PM"
				},
				{
					home_first: "Detroit",
					home_last: "Lions",
					home_id: "nfl/det",
					away_first: "New York",
					away_last: "Giants",
					away_id: "nfl/nyg",
					start: 1387746300000,
					status: "Yesterday<br />Final OT",
					label: "Final OT",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/new-york-giants-detroit-lions-20131222008/",
					home_score: "20",
					away_score: "23",
					time: "Yesterday"
				},
				{
					home_first: "Green Bay",
					home_last: "Packers",
					home_id: "nfl/gnb",
					away_first: "Pittsburgh",
					away_last: "Steelers",
					away_id: "nfl/pit",
					start: 1387747500000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/pittsburgh-steelers-green-bay-packers-20131222009/",
					home_score: "31",
					away_score: "38",
					time: "Yesterday"
				},
				{
					home_first: "Washington",
					home_last: "Redskins",
					home_id: "nfl/was",
					away_first: "Dallas",
					away_last: "Cowboys",
					away_id: "nfl/dal",
					start: 1387735200000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/dallas-cowboys-washington-redskins-20131222028/",
					home_score: "23",
					away_score: "24",
					time: "Yesterday"
				},
				{
					home_first: "Jacksonville",
					home_last: "Jaguars",
					home_id: "nfl/jac",
					away_first: "Tennessee",
					away_last: "Titans",
					away_id: "nfl/ten",
					start: 1387735200000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/tennessee-titans-jacksonville-jaguars-20131222030/",
					home_score: "16",
					away_score: "20",
					time: "Yesterday"
				},
				{
					home_first: "Seattle",
					home_last: "Seahawks",
					home_id: "nfl/sea",
					away_first: "Arizona",
					away_last: "Cardinals",
					away_id: "nfl/ari",
					start: 1387746300000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/arizona-cardinals-seattle-seahawks-20131222026/",
					home_score: "10",
					away_score: "17"
				},
				{
					home_first: "Carolina",
					home_last: "Panthers",
					home_id: "nfl/car",
					away_first: "New Orleans",
					away_last: "Saints",
					away_id: "nfl/nor",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/new-orleans-saints-carolina-panthers-20131222029/",
					home_score: "17",
					away_score: "13"
				},
				{
					home_first: "San Diego",
					home_last: "Chargers",
					home_id: "nfl/sdg",
					away_first: "Oakland",
					away_last: "Raiders",
					away_id: "nfl/oak",
					start: 1387747500000,
					status: "final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/oakland-raiders-san-diego-chargers-20131222024/",
					home_score: "26",
					away_score: "13"
				},
				{
					home_first: "St. Louis",
					home_last: "Rams",
					home_id: "nfl/stl",
					away_first: "Tampa Bay",
					away_last: "Buccaneers",
					away_id: "nfl/tam",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/tampa-bay-buccaneers-st-louis-rams-20131222014/",
					home_score: "23",
					away_score: "13"
				},
				{
					home_first: "New York",
					home_last: "Jets",
					home_id: "nfl/nyj",
					away_first: "Cleveland",
					away_last: "Browns",
					away_id: "nfl/cle",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/cleveland-browns-new-york-jets-20131222020/",
					home_score: "24",
					away_score: "13"
				}
			]
		},
		getTeams: function(cb, league) {
			var leagues = {
				nfl: {
					teams: {
						ari: "Arizona Cardinals",
						bal: "Baltimore Ravens",
						buf: "Buffalo Bills",
						chi: "Chicago Bears",
						cin: "Cincinnati Bengals",
						cle: "Cleveland Browns",
						dal: "Dallas Cowboys",
						den: "Denver Broncos",
						det: "Detroit Lions",
						gnb: "Green Bay Packers",
						hou: "Houston Texans",
						ind: "Indianapolis Colts",
						jac: "Jacksonville Jaguars",
						kan: "Kansas City Chiefs",
						mia: "Miami Dolphins",
						min: "Minnesota Vikings",
						nor: "New Orleans Saints",
						nwe: "New England Patriots",
						nyg: "New York Giants",
						nyj: "New York Jets",
						oak: "Oakland Raiders",
						phi: "Philadelphia Eagles",
						pit: "Pittsburgh Steelers",
						sdg: "San Diego Chargers",
						sea: "Seattle Seahawks",
						sfo: "San Francisco 49ers",
						stl: "St. Louis Rams",
						tam: "Tampa Bay Buccaneers",
						ten: "Tennessee Titans",
						was: "Washington Redskins"
					}
				},
				mlb: {
					teams: {
						ari: "Arizona Diamondbacks",
						atl: "Atlanta Braves",
						bal: "Baltimore Orioles",
						bos: "Boston Red Sox",
						chc: "Chicago Cubs",
						chw: "Chicago White Sox",
						cin: "Cincinnati Reds",
						cle: "Cleveland Indians",
						col: "Colorado Rockies",
						det: "Detroit Tigers",
						mia: "Miami Marlins",
						hou: "Houston Astros",
						kan: "Kansas City Royals",
						laa: "Los Angeles Angels",
						lad: "Los Angeles Dodgers",
						mil: "Milwaukee Brewers",
						min: "Minnesota Twins",
						nym: "New York Mets",
						nyy: "New York Yankees",
						oak: "Oakland Athletics",
						phi: "Philadelphia Phillies",
						pit: "Pittsburgh Pirates",
						sdg: "San Diego Padres",
						sfo: "San Francisco Giants",
						sea: "Seattle Mariners",
						stl: "St. Louis Cardinals",
						tam: "Tampa Bay Rays",
						tex: "Texas Rangers",
						tor: "Toronto Blue Jays",
						was: "Washington Nationals"
					}
				},
				nba: {
					teams: {
						atl: "Atlanta Hawks",
						bos: "Boston Celtics",
						bro: "Brooklyn Nets",
						cha: "Charlotte Bobcats",
						chi: "Chicago Bulls",
						cle: "Cleveland Cavaliers",
						dal: "Dallas Mavericks",
						den: "Denver Nuggets",
						det: "Detroit Pistons",
						gsw: "Golden State Warriors",
						hou: "Houston Rockets",
						ind: "Indiana Pacers",
						lac: "Los Angeles Clippers",
						lal: "Los Angeles Lakers",
						mem: "Memphis Grizzlies",
						mia: "Miami Heat",
						mil: "Milwaukee Bucks",
						min: "Minnesota Timberwolves",
						nor: "New Orleans Pelicans",
						nyk: "New York Knicks",
						okc: "Oklahoma City Thunder",
						orl: "Orlando Magic",
						phi: "Philadelphia 76ers",
						pho: "Phoenix Suns",
						por: "Portland Trail Blazers",
						sac: "Sacramento Kings",
						sas: "San Antonio Spurs",
						tor: "Toronto Raptors",
						uth: "Utah Jazz",
						was: "Washington Wizards"
					}
				},
				nhl: {
					teams: {
						ana: "Anaheim Ducks",
						bos: "Boston Bruins",
						buf: "Buffalo Sabres",
						car: "Carolina Hurricanes",
						cgy: "Calgary Flames",
						chi: "Chicago Blackhawks",
						cob: "Columbus Blue Jackets",
						col: "Colorado Avalanche",
						dal: "Dallas Stars",
						det: "Detroit Red Wings",
						edm: "Edmonton Oilers",
						fla: "Florida Panthers",
						los: "Los Angeles Kings",
						min: "Minnesota Wild",
						mon: "Montreal Canadiens",
						nas: "Nashville Predators",
						njd: "New Jersey Devils",
						nyi: "New York Islanders",
						nyr: "New York Rangers",
						ott: "Ottawa Senators",
						phi: "Philadelphia Flyers",
						pho: "Phoenix Coyotes",
						pit: "Pittsburgh Penguins",
						san: "San Jose Sharks",
						stl: "St. Louis Blues",
						tam: "Tampa Bay Lightning",
						tor: "Toronto Maple Leafs",
						van: "Vancouver Canucks",
						was: "Washington Capitals",
						wpg: "Winnipeg Jets"
					}
				},
				ncaaf: {
					teams: {
						aab: "Air Force",
						aac: "Akron",
						aad: "Alabama",
						aal: "Arizona",
						aam: "Arizona State",
						aan: "Arkansas",
						aap: "Arkansas State",
						aaq: "Army",
						aar: "Auburn",
						bba: "Ball State",
						bbb: "Baylor",
						bbe: "Boise State",
						bbf: "Boston College",
						bbh: "Bowling Green",
						bbp: "Buffalo",
						bbi: "BYU",
						ccd: "California",
						ccg: "Central Michigan",
						ccj: "Cincinnati",
						ccl: "Clemson",
						ccn: "Colorado",
						cco: "Colorado State",
						ccq: "Connecticut",
						ddf: "Duke",
						eea: "East Carolina",
						eef: "Eastern Michigan",
						fli: "FIU",
						ffa: "Florida",
						ffr: "Florida Atlantic",
						ffc: "Florida State",
						ffe: "Fresno State",
						ggb: "Georgia",
						gag: "Georgia State",
						ggc: "Georgia Tech",
						hhc: "Hawaii",
						hhe: "Houston",
						iia: "Idaho",
						iic: "Illinois",
						iie: "Indiana",
						iig: "Iowa",
						iih: "Iowa State",
						kka: "Kansas",
						kkb: "Kansas State",
						kkc: "Kent State",
						kkd: "Kentucky",
						ssq: "Louisiana",
						llg: "Louisiana Tech",
						nnb: "Louisiana-Monroe",
						llh: "Louisville",
						lli: "LSU",
						mmc: "Marshall",
						mmd: "Maryland",
						mme: "Massachusetts",
						mmg: "Memphis",
						mmi: "Miami (FL)",
						mmj: "Miami (OH)",
						mmk: "Michigan",
						mml: "Michigan State",
						mmm: "Middle Tennessee",
						mmn: "Minnesota",
						mmq: "Mississippi State",
						mms: "Missouri",
						nna: "Navy",
						nnd: "Nebraska",
						nnf: "Nevada",
						nnh: "New Mexico",
						nni: "New Mexico State",
						nnl: "North Carolina",
						nnn: "North Carolina State",
						nnp: "North Texas",
						nns: "Northern Illinois",
						nnv: "Northwestern",
						nnx: "Notre Dame",
						ooa: "Ohio",
						oob: "Ohio State",
						ooc: "Oklahoma",
						ood: "Oklahoma State",
						mmo: "Ole Miss",
						ooe: "Oregon",
						oof: "Oregon State",
						ppb: "Penn State",
						ppd: "Pittsburgh",
						ppj: "Purdue",
						rrb: "Rice",
						rrd: "Rutgers",
						ssb: "San Diego State",
						ssc: "San Jose State",
						ssh: "SMU",
						sal: "South Alabama",
						ssi: "South Carolina",
						sbn: "South Florida",
						sso: "Southern Miss",
						sss: "Stanford",
						ssw: "Syracuse",
						tta: "TCU",
						ttb: "Temple",
						ttd: "Tennessee",
						tth: "Texas",
						ttj: "Texas A&M",
						ssv: "Texas State",
						tto: "Texas Tech",
						ttp: "Toledo",
						ttv: "Troy",
						tts: "Tulane",
						ttt: "Tulsa",
						aaz: "UAB",
						ccf: "UCF",
						uua: "UCLA",
						nne: "UNLV",
						uub: "USC",
						uuc: "Utah",
						uud: "Utah State",
						ttl: "UTEP",
						tsa: "UTSA",
						vva: "Vanderbilt",
						vvb: "Virginia",
						vvd: "Virginia Tech",
						wwa: "Wake Forest",
						wwb: "Washington",
						wwc: "Washington State",
						wwh: "West Virginia",
						wwk: "Western Kentucky",
						wwl: "Western Michigan",
						wwo: "Wisconsin",
						wwq: "Wyoming",
						abilene_christian: "Abilene Christian (FCS)",
						aae: "Alabama A&M (FCS)",
						aaf: "Alabama State (FCS)",
						aag: "Albany (FCS)",
						aah: "Alcorn State (FCS)",
						aak: "Appalachian State (FCS)",
						aao: "Arkansas-Pine Bluff (FCS)",
						aas: "Austin Peay (FCS)",
						bbc: "Bethune-Cookman (FCS)",
						bbj: "Brown (FCS)",
						bvx: "Bryant (FCS)",
						bbk: "Bucknell (FCS)",
						bbr: "Butler (FCS)",
						caa: "Cal Poly (FCS)",
						cam: "Campbell (FCS)",
						uca: "Central Arkansas (FCS)",
						cce: "Central Connecticut State (FCS)",
						ccz: "Charleston Southern (FCS)",
						nad: "Charlotte (FCS)",
						cas: "Chattanooga (FCS)",
						cck: "Citadel (FCS)",
						cbi: "Coastal Carolina (FCS)",
						ccm: "Colgate (FCS)",
						ccp: "Columbia (FCS)",
						ccr: "Cornell (FCS)",
						dda: "Dartmouth (FCS)",
						ddb: "Davidson (FCS)",
						ddj: "Dayton (FCS)",
						ddc: "Delaware (FCS)",
						ddd: "Delaware State (FCS)",
						dde: "Drake (FCS)",
						ddi: "Duquesne (FCS)",
						eed: "Eastern Illinois (FCS)",
						eee: "Eastern Kentucky (FCS)",
						eeg: "Eastern Washington (FCS)",
						eeo: "Elon (FCS)",
						ffb: "Florida A&M (FCS)",
						ffl: "Fordham (FCS)",
						ffg: "Furman (FCS)",
						ggf: "Gardner-Webb (FCS)",
						ggk: "Georgetown (FCS)",
						ggh: "Georgia Southern (FCS)",
						ggd: "Grambling State (FCS)",
						hha: "Hampton (FCS)",
						hhb: "Harvard (FCS)",
						hhd: "Holy Cross (FCS)",
						hhf: "Howard (FCS)",
						iib: "Idaho State (FCS)",
						iid: "Illinois State (FCS)",
						incarnate_word: "Incarnate Word (FCS)",
						iif: "Indiana State (FCS)",
						jja: "Jackson State (FCS)",
						jjg: "Jacksonville (FCS)",
						jjc: "Jacksonville State (FCS)",
						jjb: "James Madison (FCS)",
						lla: "Lafayette (FCS)",
						lab: "Lamar (FCS)",
						llc: "Lehigh (FCS)",
						lle: "Liberty (FCS)",
						mma: "Maine (FCS)",
						mad: "Marist (FCS)",
						mmf: "McNeese State (FCS)",
						mercer: "Mercer (FCS)",
						mmr: "Mississippi Valley State (FCS)",
						ssu: "Missouri State (FCS)",
						mae: "Monmouth (FCS)",
						mmu: "Montana (FCS)",
						mmv: "Montana State (FCS)",
						mmw: "Morehead State (FCS)",
						mmx: "Morgan State (FCS)",
						mmz: "Murray State (FCS)",
						nng: "New Hampshire (FCS)",
						nnk: "Nicholls (FCS)",
						nan: "Norfolk State (FCS)",
						nnm: "North Carolina A&T (FCS)",
						nac: "North Carolina Central (FCS)",
						nno: "North Dakota (FCS)",
						nds: "North Dakota State (FCS)",
						nnr: "Northern Arizona (FCS)",
						nnz: "Northern Colorado (FCS)",
						nnw: "Northwestern State (FCS)",
						oah: "Old Dominion (FCS)",
						ppc: "Penn (FCS)",
						ppe: "Portland State (FCS)",
						ppf: "Prairie View A&M (FCS)",
						ppg: "Presbyterian (FCS)",
						pph: "Princeton (FCS)",
						rra: "Rhode Island (FCS)",
						rrc: "Richmond (FCS)",
						rri: "Robert Morris (FCS)",
						ses: "Sacramento State (FCS)",
						sbe: "Sacred Heart (FCS)",
						sps: "Saint Francis U (FCS)",
						ssa: "Sam Houston State (FCS)",
						sks: "Samford (FCS)",
						sbc: "San Diego (FCS)",
						ssx: "Savannah State (FCS)",
						ssj: "South Carolina State (FCS)",
						ssk: "South Dakota (FCS)",
						sds: "South Dakota State (FCS)",
						ssf: "Southeast Missouri State (FCS)",
						sse: "Southeastern Louisiana (FCS)",
						ssn: "Southern Illinois (FCS)",
						ssl: "Southern University (FCS)",
						ssp: "Southern Utah (FCS)",
						sst: "Stephen F. Austin (FCS)",
						stetson: "Stetson (FCS)",
						sbf: "Stony Brook (FCS)",
						ttf: "Tennessee State (FCS)",
						ttg: "Tennessee Tech (FCS)",
						ttn: "Texas Southern (FCS)",
						ttq: "Towson (FCS)",
						ccb: "UC Davis (FCS)",
						nnt: "UNI (FCS)",
						tte: "UTM (FCS)",
						vvi: "Valparaiso (FCS)",
						vvh: "Villanova (FCS)",
						vve: "VMI (FCS)",
						waa: "Wagner (FCS)",
						wwe: "Weber State (FCS)",
						wwi: "Western Carolina (FCS)",
						wwj: "Western Illinois (FCS)",
						wwn: "William & Mary (FCS)",
						wwp: "Wofford (FCS)",
						yya: "Yale (FCS)",
						yyb: "Youngstown State (FCS)"
					}
				}
			};

			if (leagues[league] && leagues[league].teams) {
				cb(leagues[league].teams);
			}
			else {
				cb({
					unk: "Something seems to have gone wrong"
				});
			}
		},
		refresh: function() {
			var teams = this.config.team || "";

			if (!this.config.team && this.config.teams) {
				if (typeof this.config.teams == "object") {
					teams = (this.config.teams || []).join(",");
				}
				else {
					teams = this.config.teams;
				}
			}

			$.get("https://my.yahoo.com/_td_api/resource/sports;count=10;league=" + (this.config.league || "nfl") + ";range=curr;teams=" + encodeURIComponent(teams), function(d) {
				var games = [];

				d.forEach(function(e, i) {
					var game = {
						home_first: e.home_team ? (e.home_team.first_name || "Unknown") : "Unknown Error",
						home_last: e.home_team ? (e.home_team.last_name || "Error") : "Unknown Error",
						home_id: e.home_team ? (e.home_team.id || "unk.unk").replace(".", "/") : "unk/unk",

						away_first: e.away_team ? (e.away_team.first_name || "Unknown") : "Unknown Error",
						away_last: e.away_team ? (e.away_team.last_name || "Error") : "Unknown Error",
						away_id: e.away_team ? (e.away_team.id || "unk.unk").replace(".", "/") : "unk/unk",

						start: e.start_ts || new Date().getTime(),
						status: e.status.type || "final",
						label: e.status.label || "Final",
						coverage: ((e.tv_coverage) ? (e.tv_coverage.channels || []) : []).join(", "),
						link: (e.status && e.status.link) ? (e.status.link.href || "http://sports.yahoo.com/") : "http://sports.yahoo.com/"
					};

					if (e.score) {
						game.home_score = e.score.home_team;
						game.away_score = e.score.away_team;
					}

					games.push(game);
				});

				this.data = {
					games: games
				};

				this.render.call(this);
			}.bind(this));
		},
		render: function() {
			var data = {
					games: []
				},
				games = (this.data || {games:[]}).games;
			
			if (games.length) {
				var done = 0;

				if (this.config.size == "tiny") {
					games.forEach(function(game, i) {
						if (data.games.length >= 1 || (this.config.unavailable == "none" && this.config.teams.length && this.config.teams.indexOf(game.home_id.replace("/", ".")) == -1 && this.config.teams.indexOf(game.away_id.replace("/", ".")) == -1)) {
							return;
						}

						game.time = moment(game.start);

						game.detail = "<b>" + game.home_first + " " + game.home_last + "</b> vs <b>" + game.away_first + " " + game.away_last + "</b><br />" + game.time.calendar();

						if (game.time.isAfter()) {
							if (game.time.isSame(new Date(), "day")) {
								game.status = game.time.format("h:mm A");
							}
							else {
								game.status = game.time.format("MM/DD")
							}

							if (game.coverage) {
								game.detail += "<br />Watch on: <b>" + game.coverage + "</b>";
							}
						}
						else {
							game.detail += "<br /><b>" + game.label + "</b>";

							if (game.coverage && game.status == "in_progress") {
								game.detail += "<br />Watch on: <b>" + game.coverage + "</b>";
							}

							game.status = game.home_score + " - " + game.away_score;
						}

						data.games.push(game);
					}.bind(this));
				}
				else {
					games.forEach(function(game, i) {
						if ((this.config.number && data.games.length >= this.config.number) || (this.config.unavailable == "none" && this.config.teams.length && this.config.teams.indexOf(game.home_id.replace("/", ".")) == -1 && this.config.teams.indexOf(game.away_id.replace("/", ".")) == -1)) {
							return;
						}

						game.time = moment(game.start);

						if (game.time.isAfter()) {
							game.time = game.time.calendar().replace(/^(Yesterday|[A-Z][a-z]{5,8}|[Ll]ast [A-Z][a-z]{5,8}) (at )?.*?$/g, "$1").replace("Today at", "Today,");

							game.status = game.time + "<br />" + (game.coverage ? game.coverage : "");
						}
						else {
							game.time = game.time.calendar().replace(/^(Yesterday|[A-Z][a-z]{5,8}|[Ll]ast [A-Z][a-z]{5,8}) (at )?.*?$/g, "$1").replace("Today at", "Today,");

							game.status = game.time + "<br />" + game.label;
						}

						data.games.push(game);
					}.bind(this));
				}
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	};
});