/*
 * Quotes
 */
define(["jquery", "lodash"], function($, _) {
	return {
		id: 35,
		size: 2,
		order: 12,
		nicename: "quotes",
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
				nicename: "source",
				options: {
					momentum: "Momentum",
					fortunes: "Fortunes",
					forbes: "Forbes",
					iheartquotes: "I Heart Quotes",
					quotationspage: "Quotations Page",
					thinkexist: "ThinkExist"
				},
				label: "i18n.settings.source"
			},
			{
				type: "select",
				nicename: "method",
				label: "i18n.settings.method",
				options: {
					daily: "i18n.settings.method_options.daily",
					random: "i18n.settings.method_options.random"
				}
			}
		],
		config: {
			title: "",
			size: "variable",
			source: "momentum",
			method: "random"
		},

		data: {},


		/**
		 * Contains a listing of sources.
		 * 
		 * Each source must either be an array of quotes or a specification for
		 * a URL to fetch and a parser function.
		 *
		 * Quotes should be either an array where the first item is the body and
		 * the second the source or an object with body and source keys.
		 */
		sources: {
			forbes: {
				url: "http://www.forbes.com/forbesapi/thought/get.json?limit=1&random=true&stream=true",

				/**
				 * Parses the response data
				 *
				 * @api     public
				 * @param   {Object}  d        The response data
				 * @param   {String}  unknown  The string to use in place of a missing author, if applicable
				 * @return  {Object}           A parsed quote
				 */
				parse: function(d, unknown) {
					var quote = d.thoughtStream.thoughts[0];

					return {
						body: quote.quote,
						source: (quote.thoughtAuthor || {}).name || unknown,
						link: "http://www.forbes.com/quotes/" + quote.uri
					};
				}
			},


			iheartquotes: {
				url: "http://www.iheartquotes.com/api/v1/random?max_lines=4&max_characters=130&format=json",

				parse: function(d, unknown) {
					return {
						body: d.quote.trim(),
						noquotes: true,
						link: d.link
					};
				}
			},


			quotationspage: {
				url: "http://www.quotationspage.com/random.php3?number=1&collection%5B%5D=mgm&collection%5B%5D=motivate&collection%5B%5D=classic",

				parse: function(d, unknown) {
					d = $($.parseHTML(d
						.replace(/ src="\/\//g, " data-src=\"https://")
						.replace(/ src="/g, " data-src=\"")
						.replace(/ src='\/\//g, " data-src='https://")
						.replace(/ src='/g, " data-src='")
					));

					return {
						body: d.find("dl .quote a").text().trim(),
						source: d.find("dl .author b a").text().trim(),
						link: "http://www.quotationspage.com" + d.find("dl .quote a").attr("href")
					};
				}
			},


			thinkexist: {
				url: "http://en.thinkexist.com/rss.asp?special=random",

				parse: function(d, unknown) {
					d = $(d);

					return {
						body: d.find("item description").first().text().trim().replace(/^"|"$/g, ""),
						source: d.find("item title").first().text().trim(),
						link: d.find("item link").first().text()
					};
				}
			},


			/**
			 * These quotes are the ones used by the Momentum new tab page extension
			 */
			momentum: [
				["Yesterday, you said tomorrow.", "Nike"],
				["Don't compare your beginning to someone else's middle.", "Jon Acuff"],
				["The wisest mind has something yet to learn.", "George Santayana"],
				["Be the change you wish to see in the world.", "Mahatma Gandhi"],
				["When you're going through hell, keep going.", "Winston Churchill"],
				["Don't let perfection become procrastination. Do it now.", "Danielle LaPorte"],
				["Launch and learn. Everything is progress.", "Danielle LaPorte"],
				["A year from now you will wish you had started today.", "Karen Lamb"],
				["Failure is success if you learn from it.", 0],
				["If you don't like where you are, change it. You're not a tree.", "Jim Rohn"],
				["If it ain't fun, don't do it.", "Jack Canfield"],
				["A wet man does not fear the rain.", "Risa Rodil"],
				["Stay hungry; stay foolish.", "Whole Earth Epilog, 1974"],
				["No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.", "Paul Carus, summarized from the Dhammapada, verse 165"],
				["Never give up. Never let things out of your control dictate who you are.", 0],
				["Be kind; everyone you meet is fighting a hard battle.", "Ian Maclaren"],
				["Impossible is just a big word thrown around by small men who find it easier to live in the world they've been given than to explore the power they have to change it.", "Muhammed Ali"],
				["People who are unable to motivate themselves must be content with mediocrity no matter how impressive their other talents.", "Andrew Carnegie"],
				["Progress is impossible without change, and those who cannot change their minds cannot change anything.", "George Bernard Shaw"],
				["Do more of what makes you happy.", "Carmel McConnell"],
				["Do a little more of what you want to do every day, until your idea becomes what's real.", 0],
				["You got this. Make it happen.", "Danielle LaPorte"],
				["Don't blame others as an excuse for your not working hard enough.", 0],
				["Care about what other people think and you will always be their prisoner.", "Lao Tzu"],
				["To escape criticism: do nothing, say nothing, be nothing.", "Elbert Hubbard"],
				["The world is moving so fast that the man who says it can't be done is generally interrupted by someone doing it.", "Elbert Hubbard"],
				["Be who you are and say what you feel, because those who mind don't matter and those who matter don't mind.", "Bernard Baruch"],
				["One day you will wake up and there won't be any more time to do the things you've always wanted. Do it now.", "Paulo Coelho"],
				["Never waste a minute thinking about people you don't like.", "Dwight D. Eisenhower"],
				["Never let your fear decide your fate.", "AWOLNATION, \"Kill Your Heroes\""],
				["Keep moving forward. One step at a time.", 0],
				["Life is simple. Are you happy? Yes? Keep going. No? Change something.", 0],
				["The journey of a thousand miles begins with a single step.", "Lao Tzu"],
				["First they ignore you. Then they laugh at you. Then they fight you. Then you win.", "Nicholas Klein"],
				["A man is but the product of his thoughts. What he thinks, he becomes.", "Mahatma Gandhi"],
				["Live as if you were to die tomorrow. Learn as if you were to live forever.", 0],
				["The future depends on what we do in the present.", "Mahatma Gandhi"],
				["I am strong because I've been weak. I am fearless because I've been afraid. I am wise because I've been foolish.", 0],
				["Believe in yourself.", 0],
				["Lower the cost of failure.", 0],
				["Keep your goals away from the trolls.", 0],
				["Respect yourself enough to walk away from anything that no longer serves you, grows you, or makes you happy.", "Robert Tew"],
				["Everything around you that you call life was made up by people, and you can change it.", "Steve Jobs"],
				["In times of change, learners inherit the earth, while the learned find themselves beautifully equipped to deal with a world that no longer exists.", "Eric Hoffer"],
				["If you fear failure, you will never go anywhere.", 0],
				["Go ahead, let them judge you.", 0],
				["The world breaks everyone and afterward many are strong at the broken places.", "Ernest Hemingway"],
				["The only disability in life is a bad attitude.", "Matthew Jeffers"],
				["If most of us are ashamed of shabby clothes and shoddy furniture, let us be more ashamed of shabby ideas and shoddy philosophies.", "Albert Einstein"],
				["It is no measure of health to be well adjusted to a profoundly sick society.", "J. Krishnamurti"],
				["Think lightly of yourself and deeply of the world.", "Miyamoto Musashi"],
				["Dude, suckin' at something is the first step to being sorta good at something.", "Jake, \"Adventure Time\""],
				["As you think, so shall you become.", 0],
				["Do not wish for an easy life. Wish for the strength to endure a difficult one.", "Bruce Lee"],
				["Showing off is the fool's idea of glory.", "Bruce Lee"],
				["Use only that which works, and take it from any place you can find it.", "Bruce Lee"],
				["I'm not in this world to live up to your expectations and you're not in this world to live up to mine.", "Bruce Lee"],
				["If you spend too much time thinking about a thing, you'll never get it done.", "Bruce Lee"],
				["Knowing is not enough, we must apply. Willing is not enough, we must do.", "Bruce Lee"],
				["Empty your cup so that it may be filled; become devoid to gain totality.", "Bruce Lee"],
				["It's not the daily increase but daily decrease. Hack away at the unessential.", "Bruce Lee"],
				["Be yourself. Everyone else is already taken.", "Oscar Wilde"],
				["Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.", "Martin Luther King Jr."],
				["Yesterday is history; tomorrow is a mystery. Today is a gift, which is why we call it the present.", "Bil Keane"],
				["Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", "Albert Einstein"],
				["I have not failed. I've just found 10,000 ways that won't work.", "Thomas Edison"],
				["When I let go of what I am, I become what I might be.", "Lao Tzu"],
				["It is never too late to be what you might have been.", "George Eliot"],
				["Always be yourself, express yourself, have faith in yourself. Do not go out and look for a successful personality and duplicate it.", "Bruce Lee"],
				["When you are content to be simply yourself and don't compare or compete, everyone will respect you.", "Lao Tzu"],
				["If you want to awaken all of humanity, awaken all of yourself.", "Lao Tzu"],
				["Don't regret anything you do, because in the end it makes you who you are.", 0],
				["Tension is who you think you should be. Relaxation is who you are.", 0],
				["You are confined only by the walls you build yourself.", "Andrew Murphy"],
				["Unless you try to do something beyond what you have already mastered you will never grow.", "Ralph Waldo Emerson"],
				["Don't think about what might go wrong, think about what could be right.", 0],
				["What the caterpillar calls the end, the rest of the world calls a butterfly.", "Lao Tzu"],
				["To be beautiful means to be yourself. You don't need to be accepted by others. You need to be yourself.", "Thich Nhat Hanh"],
				["Let go of those who bring you down and surround yourself with those who bring out the best in you.", 0],
				["Don't let small minds convince you that your dreams are too big.", 0],
				["If you don't like something, change it. If you can't change it, change your attitude. Don't complain.", "Maya Angelou"],
				["You may not control all the events that happen to you, but you can decide not to be reduced by them.", "Maya Angelou"],
				["I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.", "Maya Angelou"],
				["Although the world is full of suffering, it is also full of the overcoming of it.", "Helen Keller"],
				["People will forget what you said, people will forget what you did, but people will never forget how you made them feel.", "Maya Angelou"],
				["You can't climb the ladder of success with your hands in your pockets.", "Arnold Schwarzenegger"],
				["You can feel sore tomorrow or you can feel sorry tomorrow. You choose.", 0],
				["It is more important to know where you are going than to get there quickly. Do not mistake activity for achievement.", "Isocrates"],
				["There are seven days in the week and someday isn't one of them.", 0],
				["Start where you are. Use what you can. Do what you can.", "Arthur Ashe"],
				["Your dreams don't work unless you do.", "John C. Maxwell"],
				["When you wake up in the morning you have two choices: go back to sleep, or wake up and chase those dreams.", 0],
				["Everybody comes to a point in their life when they want to quit, but it's what you do at that moment that determines who you are.", "David Goggins"],
				["This is your life. Do what you love, and do it often.", "Holstee Manifesto"],
				["Live your dream, and wear your passion.", "Holstee Manifesto"],
				["Today I will do what others won't, so tomorrow I can do what others can't.", "Jerry Rice"],
				["The biggest room in the world is room for improvement.", 0],
				["If people aren't laughing at your dreams, your dreams aren't big enough.", "Grayson Marshall"],
				["Never look back unless you are planning to go that way.", "Henry David Thoreau"],
				["Every dream begins with a dreamer. Always remember, you have within you the strength, the patience, and the passion to reach for the stars to change the world.", "Harriet Tubman"],
				["You are awesome.", 0],
				["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
				["Anyone who stops learning is old.", "Henry Ford"],
				["The cure to boredom is curiosity. There is no cure for curiosity.", "Dorothy Parker"],
				["Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.", "Earl Nightingale"],
				["It's time to start living the life you've only imagined.", 0],
				["You don't have to live your life the way other people expect you to.", 0],
				["The trouble with not having a goal is that you can spend your life running up and down the field and never score.", 0],
				["To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", 0],
				["Incredible change happens in your life when you decide to take control of what you do have power over instead of craving control over what you don't.", "Steve Maraboli, \"Life, the Truth, and Being Free\""],
				["Do more with less.", 0],
				["Overthinking ruins you. Ruins the situation, twists it around, makes you worry and just makes everything much worse than it actually is.", 0],
				["Replace fear of the unknown with curiosity.", 0],
				["The surest way to find your dream job is to create it.", 0],
				["What you do today is important because you are exchanging a day of your life for it.", 0],
				["One man or woman with courage is a majority.", 0],
				["Do one thing every day that scares you.", "Eleanor Roosevelt"],
				["Failure is simply the opportunity to begin again, this time more intelligently.", "Henry Ford"],
				["Don't just wait for inspiration. Become it.", 0],
				["Don't limit your challenges - challenge your limits.", 0],
				["When you judge others, you do not define them; you define yourself.", "Earl Nightingale"],
				["Time you enjoy wasting is not wasted time.", 0],
				["Do small things with great love.", "Mother Teresa"],
				["Go forth and make awesomeness.", 0],
				["Your big opportunity may be right where you are now.", "Napolean Hill"],
				["Life begins at the end of your comfort zone.", "Neale Donald Walsch"],
				["Excuses are born out of fear. Eliminate your fear and there will be no excuses.", 0],
				["Happiness is not the absence of problems, it's the ability to deal with them.", 0],
				["The problem is not the problem. The problem is your attitude about the problem.", 0],
				["You don't have to be great to start, but you have to start to be great.", 0],
				["Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.", 0],
				["Decide that you want it more than you are afraid of it.", 0],
				["Adventure may hurt you, but monotony will kill you.", 0],
				["Obsessed is a word that the lazy use to describe the dedicated.", 0],
				["If they can do it, so can you.", 0],
				["Success isn't about being the best. It's about always getting better.", "Behance 99U"],
				["Success is the ability to go from failure to failure without losing your enthusiasm.", "Winston Churchill"],
				["A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty.", "Winston Churchill"],
				["Failure is just practice for success.", 0],
				["Shipping beats perfection.", 0],
				["Failure is simply the opportunity to begin again. This time more intelligently.", "Henry Ford"],
				["While we are postponing, life speeds by.", "Seneca"],
				["It always seems impossible until it's done.", "Nelson Mandela"],
				["Don't let the mistakes and disappointments of the past control and direct your future.", "Zig Ziglar"],
				["It's not about where your starting point is, but your end goal and the journey that will get you there.", 0],
				["Waste no more time arguing about what a good person should be. Be one.", "Marcus Aurelius"],
				["Life shrinks or expands in proportion to one's courage.", "Anaïs Nin"],
				["Absorb what is useful. Discard what is not. Add what is uniquely your own.", "Bruce Lee"],
				["Don't find fault. Find a remedy.", "Henry Ford"],
				["Doubt kills more dreams than failure ever will.", "Suzy Kassem"],
				["Don't let someone who gave up on their dreams talk you out of going after yours.", "Zig Ziglar"],
				["Always remember that the future comes one day at a time.", "Dean Acheson"],
				["The creative adult is the child who survived.", "Ursula K. Le Guin"],
				["When you have exhausted all possibilities, remember this: you haven't.", "Thomas Edison"],
				["When you see a person without a smile, give them one of yours.", "Zig Ziglar"],
				["If you hear a voice within you say 'you cannot paint,' then by all means paint and that voice will be silenced.", "Vincent Van Gogh"],
				["The secret to happiness is freedom. And the secret to freedom is courage.", "Thucydides"],
				["May your choices reflect your hopes, not your fears.", "Nelson Mandela"],
				["Once a year, go some place you've never been before.", "Dalai Lama"],
				["Never underestimate the ability of a small group of dedicated people to change the world. Indeed, it is the only thing that ever has.", "Margaret Meade"],
				["To be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.", "Nelson Mandela"],
				["Today is the most important day of our lives.", "Thich Nhat Hanh"],
				["All great achievements require time.", "Maya Angelou"],
				["Winning starts with beginning.", 0],
				["If you're not doing what you love, you're wasting your time.", 0],
				["A goal is not always meant to be reached, it often serves simply as something to aim at.", "Bruce Lee"],
				["The struggle ends when the gratitude begins.", 0],
				["Muddy water is best cleared by leaving it alone.", "Alan Watts"],
				["Someone who thinks the world is always cheating him is right. He is missing that wonderful feeling of trust in someone or something.", "Eric Hoffer"],
				["We cannot teach people anything. We can only help them discover it within themselves.", "Galileo Galilei"],
				["How we spend our days is, of course, how we spend our lives.", "Annie Dillard"],
				["I would rather die of passion than of boredom.", "Vincent Van Gogh"],
				["Make sure your worst enemy doesn't live between your two ears.", "Laird Hamilton"],
				["You can't use up creativity. The more you use the more you have.", "Maya Angelou"],
				["The secret of change is to focus all of your energy, not on fighting the old but on building the new.", 0],
				["Whenever you see a successful business, someone once made a courageous decision.", "Peter Drucker"],
				["If you stumble make it part of the dance.", 0],
				["Each day wake up and ask yourself what will make you feel most alive that day.", 0],
				["Choose a job you love and you will never have to work a day of your life.", "Confucius"],
				["It is not the load that breaks you down. It's the way you carry it.", "Lou Holtz"],
				["If you want to go fast, go alone. If you want to go far, bring others along.", 0],
				["Decide that you want it more than you are afraid of it.", 0],
				["Children are wonderfully confident in their own imaginations. Most of us lose this confidence as we grow up.", "Sir Ken Robinson"],
				["It is possible to commit no mistakes and still lose. That is not a weakness; that is life.", "Jean Luc Picard"],
				["So many of our dreams at first seem impossible. Then they seem improbable. And then, when we summon the will, they soon become inevitable.", "Nelson Mandela"],
				["If you don't prioritize your life, someone else will.", "Greg McKeown"],
				["Argue for your limitations, and surely they’re yours.", "Richard Bach"],
				["There is only one person who could ever make you happy, and that person is you.", "David Burns"],
				["A goal without a plan is only a wish.", 0],
				["Every person is a new door to a different world.", "Six Degrees of Separation"],
				["On your journey through life, make sure your biography has at least one extraordinary chapter.", 0],
				["The journey is the reward.", "Steve Jobs"],
				["Know well what leads you forward and what holds you back, and choose the path that leads you to wisdom.", "Buddha"],
				["The meaning of life is to find your gift. The purpose of life is to give it away.", "Pablo Picasso"],
				["The master has failed more times than the beginner has even tried.", "Stephen McCranie"],
				["Jumping from failure to failure with undiminished enthusiasm is the big secret to success.", "Savas Dimopoulos"],
				["Fear does not prevent death. It prevents life.", "Naguib Mahfouz"],
				["Great things are done by a series of small things brought together.", "Vincent Van Gogh"],
				["The way to get started is to quit talking and begin doing.", "Walt Disney"],
				["What are the most powerful words in the universe? The ones you use to talk to yourself.", "Karen Salmansohn"],
				["Within you is a stillness and a sanctuary to which you can retreat at any time and be yourself.", "Hermann Hesse"],
				["Spend more time smiling than frowning and more time praising than criticizing.", "Richard Branson"],
				["Success is something you attract by the person you become.", "Jim Rohn"],
				["Always remember you are braver than you believe, stronger than you seem, and smarter than you think", "A. A. Milne"],
				["Don't underestimate the value of doing nothing, of just going along, listening to all the things you can't hear, and not bothering.", "Winnie the Pooh"],
				["It's up to you how far you go. If you don't try, you'll never know!", "Merlin, \"Sword in the Stone\""],
				["The only way to learn it is to do it.", "Archimedes, \"Sword in the Stone\""],
				["In matters of style swim with the current. In matters of principle, stand like a rock.", 0],
				["You are never too old to set another goal or to dream a new dream.", "C. S. Lewis"],
				["Whenever you are confronted with an opponent, conquer him with love.", "Mahatma Gandhi"],
				["The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", "Steve Jobs"],
				["The best teachers are those who show you where to look, but don't tell you what to see.", "Alexandra K. Trenfor"],
				["It’s not what you look at that matters, it’s what you see.", "Henry David Thoreau"],
				["Rules for happiness: something to do, someone to love, something to hope for.", "Immanuel Kant"],
				["When feeling overwhelmed by a faraway goal, repeat the following: I have it within me right now, to get me to where I want to be later.", "Karen Salmansohn"],
				["If you have good thoughts they will shine out of your face like sunbeams and you will always look lovely.", "Roald Dahl"],
				["You have power over your mind, not outside events. Realize this, and you will find strength.", "Marcus Aurelius"],
				["You cannot protect yourself from sadness without protecting yourself from happiness.", "Jonathan Safran Foer"],
				["Act as if what you do makes a difference. It does.", "William James"],
				["Progress lies not in enhancing what is, but in advancing toward what will be.", "Khalil Gibran"],
				["Sitting quietly, doing nothing, Spring comes, and the grass grows by itself.", "Matsuo Basho"],
				["You can't be paralyzed by fear of failure or you will never push yourself.", "Arnold Schwarzenegger"],
				["Ask yourself, who do you want to be? Figure out for yourself what makes you happy, no matter how crazy it may sound to other people.", "Arnold Schwarzenegger"],
				["We either make ourselves miserable, or we make ourselves strong. The amount of work is the same.", "Carlos Castaneda"],
				["What weakens us is feeling offended by the deeds and misdeeds of our fellow men. Our self-importance requires that we spend most of our lives offended by someone.", "Carlos Castaneda"],
				["If you can dream it, you can do it.", "Walt Disney"],
				["Open your eyes, look within. Are you satisfied with the life you're living?", "Bob Marley"],
				["If I quit now, I will soon be back to where I started. And when I started I was desperately wishing to be where I am now.", 0],
				["Most people quit because they look how far they have to go, not how far they have come.", "Anonymous"],
				["If you have a dream, don’t just sit there. Gather courage to believe that you can succeed and leave no stone unturned to make it a reality.", "Dr Rooplen"],
				["Don’t let mental blocks control you. Set yourself free. Confront your fear and turn the mental blocks into building blocks.", "Dr Rooplen"],
				["Believe in yourself. Under-confidence leads to a self-fulfilling prophecy that you are not good enough for your work.", "Dr Rooplen"],
				["The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it.", "Jordan Belfort"],
				["The fear of death follows from the fear of life. One who lives life fully is prepared to die at any time.", "Mark Twain"],
				["There are only two ways to live your life. One is as though nothing is a miracle. The other is as though everything is a miracle.", "Albert Einstein"],
				["Good judgment comes from experience, and a lot of that comes from bad judgment.", "Will Rogers"],
				["As long as you're being a copycat, you will never be the best copycat.", "Eric Thomas"],
				["Life has no limitations, except the ones you make.", "Les Brown"],
				["Do what you can, with what you have, where you are.", "Theodore Roosevelt"],
				["Your world is a living expression of how you are using—and have used—your mind.", "Earl Nightingale"],
				["Learn to enjoy every minute of your life. Be happy now. Don't wait for something outside of yourself to make you happy in the future. ", "Earl Nightingale"],
				["Whatever we plant in our subconscious mind and nourish with repetition and emotion will one day become reality.", "Earl Nightingale"],
				["Our attitude toward life determines life's attitude towards us.", "Earl Nightingale"],
				["Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day whispering, 'I will try again tomorrow.'", "Mary Anne Radmacher"],
				["There is no small act of kindness. Every compassionate act makes large the world.", "Mary Anne Radmacher"],
				["No one has the power to shatter your dreams unless you give it to them.", "Maeve Greyson"],
				["If you really believe in what you're doing, work hard, take nothing personally and if something blocks one route, find another. Never give up.", "Laurie Notaro"],
				["The death of a dream is the day that you stop believing in the work it takes to get there.", "Chris Burkmenn"],
				["If you change nothing, nothing will change", "Tony Robbins"],
				["It doesn’t matter where you are, you are nowhere compared to where you can go.", "Bob Proctor"],
				["I can accept failure. Everyone fails at something. But I can’t accept not trying.", "Michael Jordan"],
				["The greatest mistake you can make in life is to be continually fearing you will make one.", "Elbert Hubbard"],
				["Nothing diminishes anxiety faster than action.", "Walter Anderson"],
				["Use what talents you possess, the woods will be very silent if no birds sang there except those that sang best.", "Henry van Dyke"],
				["Sometimes good things fall apart so better things can fall together.", "Marilyn Monroe"],
				["Fear, uncertainty and discomfort are your compasses toward growth.", 0],
				["If you cannot do great things, do small things in a great way.", "Napoleon Hill"],
				["Sometimes life hits you in the head with a brick. Don't lose faith.", "Steve Jobs"],
				["Without new experiences, something inside of us sleeps. The sleeper must awaken.", "Frank Herbert"],
				["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "Ralph Waldo Emerson"],
				["Don't let the noise of others' opinions drown out your own inner voice. Have the courage to follow your own heart and intuition.", "Steve Jobs"],
				["‎Do not seek to follow in the footsteps of others, instead, seek what they sought.", "Matsuo Basho"],
				["If you wish to travel far and fast, travel light. Take off all your envies, jealousies, unforgiveness, selfishness, and fears.", "Glenn Clark"],
				["If you are still looking for that one person who will change your life, take a look in the mirror.", "Roman Price"],
				["Be who you were created to be, and you will set the world on fire.", "St. Catherine of Sienna"],
				["Forget all the reasons why it won't work and believe the one reason why it will.", 0],
				["Your value doesn't decrease based on someone's inability to see your worth.", 0],
				["Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.", "Mandy Hale"],
				["If you find yourself constantly trying to prove your worth to someone, you have already forgotten your value.", 0],
				["Don't let yesterday use up too much of today.", "Will Rogers"],
				["Kindness is more important than wisdom, and the recognition of this is the beginning of wisdom.", "Theodore Isaac Rubin"],
				["Dream big dreams. Small dreams have no magic.", "Dottie Boreyko"],
				["Destiny is not a matter of chance; it is a matter of choice. It is not a thing to be waited for, it is a thing to be achieved.", "William Jennings Bryan"],
				["What you seek is seeking you.", "Rumi"],
				["If you lose, don't lose the lesson.", "Dalai Lama"]
			],


			/**
			 * Linux fortunes used in DuckDuckGo's fortune goodie.  They're originally
			 * from https://github.com/mokus0/misfortune/blob/master/data/normal/fortune-mod/fortunes
			 */
			fortunes: [
				["A day for firm decisions!!!!!  Or is it?"],
				["A few hours grace before the madness begins again."],
				["A gift of a flower will soon be made to you."],
				["A long-forgotten loved one will appear soon.\nBuy the negatives at any price."],
				["A tall, dark stranger will have more fun than you."],
				["A visit to a fresh place will bring strange work."],
				["A visit to a strange place will bring fresh work."],
				["A vivid and creative mind characterizes you."],
				["Abandon the search for Truth; settle for a good fantasy."],
				["Accent on helpful side of your nature.  Drain the moat."],
				["Advancement in position."],
				["After your lover has gone you will still have PEANUT BUTTER!"],
				["Afternoon very favorable for romance.  Try a single person for a change."],
				["Alimony and bribes will engage a large share of your wealth."],
				["All the troubles you have will pass away very quickly."],
				["Among the lucky, you are the chosen one."],
				["An avocado-tone refrigerator would look good on your resume."],
				["An exotic journey in downtown Newark is in your future."],
				["Another good night not to sleep in a eucalyptus tree."],
				["Are you a turtle?"],
				["Are you ever going to do the dishes?  Or will you change your major to biology?"],
				["Are you making all this up as you go along?"],
				["Are you sure the back door is locked?"],
				["Artistic ventures highlighted.  Rob a museum."],
				["Avert misunderstanding by calm, poise, and balance."],
				["Avoid gunfire in the bathroom tonight."],
				["Avoid reality at all costs."],
				["Bank error in your favor.  Collect $200."],
				["Be careful!  Is it classified?"],
				["Be careful!  UGLY strikes 9 out of 10!"],
				["Be cautious in your daily affairs."],
				["Be cheerful while you are alive.", "Phathotep, 24th Century B.C."],
				["Be different: conform."],
				["Be free and open and breezy!  Enjoy!  Things won't get any better so get used to it."],
				["Be security conscious -- National defense is at stake."],
				["Beauty and harmony are as necessary to you as the very breath of life."],
				["Best of all is never to have been born.  Second best is to die soon."],
				["Better hope the life-inspector doesn't come around while you have your life in such a mess."],
				["Beware of a dark-haired man with a loud tie."],
				["Beware of a tall black man with one blond shoe."],
				["Beware of a tall blond man with one black shoe."],
				["Beware of Bigfoot!"],
				["Beware of low-flying butterflies."],
				["Beware the one behind you."],
				["Blow it out your ear."],
				["Break into jail and claim police brutality."],
				["Bridge ahead.  Pay troll."],
				["Caution: breathing may be hazardous to your health."],
				["Caution: Keep out of reach of children."],
				["Celebrate Hannibal Day this year.  Take an elephant to lunch."],
				["Change your thoughts and you change your world."],
				["Cheer Up!  Things are getting worse at a slower rate."],
				["Chess tonight."],
				["Chicken Little only has to be right once."],
				["Chicken Little was right."],
				["Cold hands, no gloves."],
				["Communicate!  It can't make things any worse."],
				["Courage is your greatest present need."],
				["Day of inquiry.  You will be subpoenaed."],
				["Do not overtax your powers."],
				["Do not sleep in a eucalyptus tree tonight."],
				["Do nothing unless you must, and when you must act -- hesitate."],
				["Do something unusual today.  Pay a bill."],
				["Do what comes naturally.  Seethe and fume and throw a tantrum."],
				["Domestic happiness and faithful friends."],
				["Don't feed the bats tonight."],
				["Don't get stuck in a closet -- wear yourself out."],
				["Don't get to bragging."],
				["Don't go surfing in South Dakota for a while."],
				["Don't hate yourself in the morning -- sleep till noon."],
				["Don't kiss an elephant on the lips today."],
				["Don't let your mind wander -- it's too little to be let out alone."],
				["Don't look back, the lemmings are gaining on you."],
				["Don't look now, but the man in the moon is laughing at you."],
				["Don't look now, but there is a multi-legged creature on your shoulder."],
				["Don't plan any hasty moves.  You'll be evicted soon anyway."],
				["Don't read any sky-writing for the next two weeks."],
				["Don't read everything you believe."],
				["Don't relax!  It's only your tension that's holding you together."],
				["Don't tell any big lies today.  Small ones can be just as effective."],
				["Don't worry so loud, your roommate can't think."],
				["Don't Worry, Be Happy.", "Meher Baba"],
				["Don't worry.  Life's too long.", "Vincent Sardi, Jr."],
				["Don't you feel more like you do now than you did when you came in?"],
				["Don't you wish you had more energy... or less ambition?"],
				["Everything that you know is wrong, but you can be straightened out."],
				["Everything will be just tickety-boo today."],
				["Excellent day for putting Slinkies on an escalator."],
				["Excellent day to have a rotten day."],
				["Excellent time to become a missing person."],
				["Executive ability is prominent in your make-up."],
				["Exercise caution in your daily affairs."],
				["Expect a letter from a friend who will ask a favor of you."],
				["Expect the worst, it's the least you can do."],
				["Fine day for friends.\nSo-so day for you."],
				["Fine day to work off excess energy.  Steal something heavy."],
				["You will be attacked next Wednesday at 3:15 P.M. by six samurai sword wielding purple fish glued to Harley-Davidson motorcycles."],
				["Oh, and have a nice day!", "Bryce Nesbitt '84"],
				["Future looks spotty.  You will spill soup in late evening."],
				["Generosity and perfection are your everlasting goals."],
				["Give him an evasive answer."],
				["Give thought to your reputation.  Consider changing name and moving to a new town."],
				["Give your very best today.  Heaven knows it's little enough."],
				["Go to a movie tonight.  Darkness becomes you."],
				["Good day for a change of scene.  Repaper the bedroom wall."],
				["Good day for overcoming obstacles.  Try a steeplechase."],
				["Good day to deal with people in high places; particularly lonely stewardesses."],
				["Good day to let down old friends who need help."],
				["Good news from afar can bring you a welcome visitor."],
				["Good news.  Ten weeks from Friday will be a pretty good day."],
				["Good night to spend with family, but avoid arguments with your mate's new lover."],
				["Green light in A.M. for new projects.  Red light in P.M. for traffic tickets."],
				["Hope that the day after you die is a nice day."],
				["If you can read this, you're too close."],
				["If you learn one useless thing every day, in a single year you'll learn 365 useless things."],
				["If you sow your wild oats, hope for a crop failure."],
				["If you stand on your head, you will get footprints in your hair."],
				["If you think last Tuesday was a drag, wait till you see what happens tomorrow!"],
				["If your life was a horse, you'd have to shoot it."],
				["In the stairway of life, you'd best take the elevator."],
				["Increased knowledge will help you now.  Have mate's phone bugged."],
				["Is that really YOU that is reading this?"],
				["Is this really happening?"],
				["It is so very hard to be an on-your-own-take-care-of-yourself-because-there-is-no-one-else-to-do-it-for-you grown-up."],
				["It may or may not be worthwhile, but it still has to be done."],
				["It was all so different before everything changed."],
				["It's a very *UN*lucky week in which to be took dead.", "Churchy La Femme"],
				["It's all in the mind, ya know."],
				["It's lucky you're going so slowly, because you're going in the wrong direction."],
				["Just because the message may never be received does not mean it is not worth sending."],
				["Just to have it is enough."],
				["Keep emotionally active.  Cater to your favorite neurosis."],
				["Keep it short for pithy sake."],
				["Lady Luck brings added income today.  Lady friend takes it away tonight."],
				["Learn to pause -- or nothing worthwhile can catch up to you."],
				["Let me put it this way: today is going to be a learning experience."],
				["Life is to you a dashing and bold adventure."],
				["Life, loathe it or ignore it, you can't like it.", "Marvin, \"Hitchhiker's Guide to the Galaxy\""],
				["Live in a world of your own, but always welcome visitors."],
				["Living your life is a task so difficult, it has never been attempted before."],
				["Long life is in store for you."],
				["Look afar and see the end from the beginning."],
				["Love is in the offing.  Be affectionate to one who adores you."],
				["Make a wish, it might come true."],
				["Many changes of mind and mood; do not hesitate too long."],
				["Never be led astray onto the path of virtue."],
				["Never commit yourself!  Let someone else commit you."],
				["Never give an inch!"],
				["Never look up when dragons fly overhead."],
				["Never reveal your best argument."],
				["Next Friday will not be your lucky day.  As a matter of fact, you don't have a lucky day this year."],
				["Of course you have a purpose -- to find a purpose."],
				["People are beginning to notice you.  Try dressing before you leave the house."],
				["Perfect day for scrubbing the floor and other exciting things."],
				["Questionable day.\nAsk somebody something."],
				["Reply hazy, ask again later."],
				["Save energy: be apathetic."],
				["Ships are safe in harbor, but they were never meant to stay there."],
				["Slow day.  Practice crawling."],
				["Snow Day -- stay home."],
				["So this is it.  We're going to die."],
				["So you're back... about time..."],
				["Someone is speaking well of you."],
				["Someone is speaking well of you.\nHow unusual!"],
				["Someone whom you reject today, will reject you tomorrow."],
				["Stay away from flying saucers today."],
				["Stay away from hurricanes for a while."],
				["Stay the curse."],
				["That secret you've been guarding, isn't."],
				["The time is right to make new friends."],
				["The whole world is a tuxedo and you are a pair of brown shoes.", "George Gobel"],
				["There is a 20% chance of tomorrow."],
				["There is a fly on your nose."],
				["There was a phone call for you."],
				["There will be big changes for you but you will be happy."],
				["Things will be bright in P.M.  A cop will shine a light in your face."],
				["Think twice before speaking, but don't say \"think think click click\"."],
				["This life is yours.  Some of it was given to you; the rest, you made yourself."],
				["This will be a memorable month -- no matter how hard you try to forget it."],
				["Time to be aggressive.  Go after a tattooed Virgo."],
				["Today is National Existential Ennui Awareness Day."],
				["Today is the first day of the rest of the mess."],
				["Today is the first day of the rest of your life."],
				["Today is the last day of your life so far."],
				["Today is the tomorrow you worried about yesterday."],
				["Today is what happened to yesterday."],
				["Today's weirdness is tomorrow's reason why.", "Hunter S. Thompson"],
				["Tomorrow will be cancelled due to lack of interest."],
				["Tomorrow, this will be part of the unchangeable past but fortunately, it can still be changed today."],
				["Tomorrow, you can be anywhere."],
				["Tonight you will pay the wages of sin; Don't forget to leave a tip."],
				["Tonight's the night: Sleep in a eucalyptus tree."],
				["Troubled day for virgins over 16 who are beautiful and wealthy and live in eucalyptus trees."],
				["Truth will out this morning.  (Which may really mess things up.)"],
				["Try the Moo Shu Pork.  It is especially good today."],
				["Try to get all of your posthumous medals in advance."],
				["Try to have as good a life as you can under the circumstances."],
				["Try to relax and enjoy the crisis.", "Ashleigh Brilliant"],
				["Try to value useful qualities in one who loves you."],
				["Tuesday After Lunch is the cosmic time of the week."],
				["Tuesday is the Wednesday of the rest of your life."],
				["What happened last night can happen again."],
				["While you recently had your problems on the run, they've regrouped and are making another attack."],
				["Write yourself a threatening letter and pen a defiant reply."],
				["You are a bundle of energy, always on the go."],
				["You are a fluke of the universe; you have no right to be here."],
				["You are a very redundant person, that's what kind of person you are."],
				["You are always busy."],
				["You are as I am with You."],
				["You are capable of planning your future."],
				["You are confused; but this is your normal state."],
				["You are deeply attached to your friends and acquaintances."],
				["You are destined to become the commandant of the fighting men of the department of transportation."],
				["You are dishonest, but never to the point of hurting a friend."],
				["You are fairminded, just and loving."],
				["You are farsighted, a good planner, an ardent lover, and a faithful friend."],
				["You are fighting for survival in your own sweet and gentle way."],
				["You are going to have a new love affair."],
				["You are magnetic in your bearing."],
				["You are not dead yet.  But watch for further reports."],
				["You are number 6!  Who is number one?"],
				["You are only young once, but you can stay immature indefinitely."],
				["You are scrupulously honest, frank, and straightforward.  Therefore you have few friends."],
				["You are sick, twisted and perverted.  I like that in a person."],
				["You are so boring that when I see you my feet go to sleep."],
				["You are standing on my toes."],
				["You are taking yourself far too seriously."],
				["You are the only person to ever get this message."],
				["You are wise, witty, and wonderful, but you spend too much time reading this sort of trash."],
				["You attempt things that you do not even plan because of your extreme stupidity."],
				["You can create your own opportunities this week.  Blackmail a senior executive."],
				["You can do very well in speculation where land or anything to do with dirt is concerned."],
				["You can rent this space for only $5 a week."],
				["You could live a better life, if you had a better mind and a better body."],
				["You definitely intend to start living sometime soon."],
				["You dialed 5483."],
				["You display the wonderful traits of charm and courtesy."],
				["You don't become a failure until you're satisfied with being one."],
				["You enjoy the company of other people."],
				["You feel a whole lot more like you do now than you did when you used to."],
				["You fill a much-needed gap."],
				["You get along very well with everyone except animals and people."],
				["You had some happiness once, but your parents moved away, and you had to leave it behind."],
				["You have a deep appreciation of the arts and music."],
				["You have a deep interest in all that is artistic."],
				["You have a reputation for being thoroughly reliable and trustworthy.\nA pity that it's totally undeserved."],
				["You have a strong desire for a home and your family interests come first."],
				["You have a truly strong individuality."],
				["You have a will that can be influenced by all with whom you come in contact."],
				["You have an ability to sense and know higher truth."],
				["You have an ambitious nature and may make a name for yourself."],
				["You have an unusual equipment for success.  Be sure to use it properly."],
				["You have an unusual magnetic personality.  Don't walk too close to metal objects which are not fastened down."],
				["You have an unusual understanding of the problems of human relationships."],
				["You have been selected for a secret mission."],
				["You have Egyptian flu: you're going to be a mummy."],
				["You have had a long-term stimulation relative to business."],
				["You have literary talent that you should take pains to develop."],
				["You have many friends and very few living enemies."],
				["You have no real enemies."],
				["You have taken yourself too seriously."],
				["You have the body of a 19 year old.  Please return it before it gets wrinkled."],
				["You have the capacity to learn from mistakes.  You'll learn a lot today."],
				["You have the power to influence all with whom you come in contact."],
				["You learn to write as if to someone else because NEXT YEAR YOU WILL BE \"SOMEONE ELSE.\""],
				["You like to form new friendships and make new acquaintances."],
				["You look like a million dollars.  All green and wrinkled."],
				["You look tired."],
				["You love peace."],
				["You love your home and want it to be beautiful."],
				["You may be gone tomorrow, but that doesn't mean that you weren't here today."],
				["You may be infinitely smaller than some things, but you're infinitely larger than others."],
				["You may be recognized soon.  Hide."],
				["You may get an opportunity for advancement today.  Watch it!"],
				["You may worry about your hair-do today, but tomorrow much peanut butter will be sold."],
				["You need more time; and you probably always will."],
				["You need no longer worry about the future.  This time tomorrow you'll be dead."],
				["You never hesitate to tackle the most difficult problems."],
				["You never know how many friends you have until you rent a house on the beach."],
				["You now have Asian Flu."],
				["You own a dog, but you can only feed a cat."],
				["You plan things that you do not even attempt because of your extreme caution."],
				["You possess a mind not merely twisted, but actually sprained."],
				["You recoil from the crude; you tend naturally toward the exquisite."],
				["You seek to shield those you love and you like the role of the provider."],
				["You shall be rewarded for a dastardly deed."],
				["You should emulate your heros, but don't carry it too far.  Especially if they are dead."],
				["You should go home."],
				["You single-handedly fought your way into this hopeless mess."],
				["You teach best what you most need to learn."],
				["You too can wear a nose mitten."],
				["You two ought to be more careful--your love could drag on for years and years."],
				["You will always get the greatest recognition for the job you least like."],
				["You will always have good luck in your personal affairs."],
				["You will attract cultured and artistic people to your home."],
				["You will be a winner today.  Pick a fight with a four-year-old."],
				["You will be advanced socially, without any special effort on your part."],
				["You will be aided greatly by a person whom you thought to be unimportant."],
				["You will be attacked by a beast who has the body of a wolf, the tail of a lion, and the face of Donald Duck."],
				["You will be audited by the Internal Revenue Service."],
				["You will be awarded a medal for disregarding safety in saving someone."],
				["You will be awarded some great honor."],
				["You will be awarded the Nobel Peace Prize... posthumously."],
				["You will be called upon to help a friend in trouble."],
				["You will be divorced within a year."],
				["You will be given a post of trust and responsibility."],
				["You will be held hostage by a radical group."],
				["You will be honored for contributing your time and skill to a worthy cause."],
				["You will be imprisoned for contributing your time and skill to a bank robbery."],
				["You will be married within a year, and divorced within two."],
				["You will be married within a year."],
				["You will be misunderstood by everyone."],
				["You will be recognized and honored as a community leader."],
				["You will be reincarnated as a toad; and you will be much happier."],
				["You will be run over by a beer truck."],
				["You will be run over by a bus."],
				["You will be singled out for promotion in your work."],
				["You will be successful in love."],
				["You will be surprised by a loud noise."],
				["You will be surrounded by luxury."],
				["You will be the last person to buy a Chrysler."],
				["You will be the victim of a bizarre joke."],
				["You will be Told about it Tomorrow.  Go Home and Prepare Thyself."],
				["You will be traveling and coming into a fortune."],
				["You will be winged by an anti-aircraft battery."],
				["You will become rich and famous unless you don't."],
				["You will contract a rare disease."],
				["You will engage in a profitable business activity."],
				["You will experience a strong urge to do good; but it will pass."],
				["You will feel hungry again in another hour."],
				["You will forget that you ever knew me."],
				["You will gain money by a fattening action."],
				["You will gain money by a speculation or lottery."],
				["You will gain money by an illegal action."],
				["You will gain money by an immoral action."],
				["You will get what you deserve."],
				["You will give someone a piece of your mind, which you can ill afford."],
				["You will have a long and boring life."],
				["You will have a long and unpleasant discussion with your supervisor."],
				["You will have domestic happiness and faithful friends."],
				["You will have good luck and overcome many hardships."],
				["You will have long and healthy life."],
				["You will hear good news from one you thought unfriendly to you."],
				["You will inherit millions of dollars."],
				["You will inherit some money or a small piece of land."],
				["You will live a long, healthy, happy life and make bags of money."],
				["You will live to see your grandchildren."],
				["You will lose your present job and have to become a door to door mayonnaise salesman."],
				["You will meet an important person who will help you advance professionally."],
				["You will never know hunger."],
				["You will not be elected to public office this year."],
				["You will obey or molten silver will be poured into your ears."],
				["You will outgrow your usefulness."],
				["You will overcome the attacks of jealous associates."],
				["You will pass away very quickly."],
				["You will pay for your sins.  If you have already paid, please disregard this message."],
				["You will pioneer the first Martian colony."],
				["You will probably marry after a very brief courtship."],
				["You will reach the highest possible point in your business or profession."],
				["You will receive a legacy which will place you above want."],
				["You will remember something that you should not have forgotten."],
				["You will soon forget this."],
				["You will soon meet a person who will play an important role in your life."],
				["You will step on the night soil of many countries."],
				["You will stop at nothing to reach your objective, but only because your brakes are defective."],
				["You will triumph over your enemy."],
				["You will visit the Dung Pits of Glive soon."],
				["You will win success in whatever calling you adopt."],
				["You will wish you hadn't."],
				["You work very hard.  Don't try to think as well."],
				["You worry too much about your job.  Stop it.  You are not paid enough to worry."],
				["You would if you could but you can't so you won't."],
				["You'd like to do it instantaneously, but that's too slow."],
				["You'll be called to a post requiring ability in handling groups of people."],
				["You'll be sorry..."],
				["You'll feel devilish tonight.  Toss dynamite caps under a flamenco dancer's heel."],
				["You'll feel much better once you've given up hope."],
				["You'll never be the man your mother was!"],
				["You'll never see all the places, or read all the books, but fortunately, they're not all recommended."],
				["You'll wish that you had done some of the hard things when they were easier to do."],
				["You're a card which will have to be dealt with."],
				["You're almost as happy as you think you are."],
				["You're at the end of the road again."],
				["You're being followed.  Cut out the hanky-panky for a few days."],
				["You're currently going through a difficult transition period called \"Life.\""],
				["You're definitely on their list.  The question to ask next is what list it is."],
				["You're growing out of some of your problems, but there are others that you're growing into."],
				["You're not my type.  For that matter, you're not even my species!!!"],
				["You're ugly and your mother dresses you funny."],
				["You're working under a slight handicap.  You happen to be human."],
				["You've been leading a dog's life.  Stay off the furniture."],
				["Your aim is high and to the right."],
				["Your aims are high, and you are capable of much."],
				["Your analyst has you mixed up with another patient.  Don't believe a thing he tells you."],
				["Your best consolation is the hope that the things you failed to get weren't really worth having."],
				["Your boss climbed the corporate ladder, wrong by wrong."],
				["Your boss is a few sandwiches short of a picnic."],
				["Your boyfriend takes chocolate from strangers."],
				["Your business will assume vast proportions."],
				["Your business will go through a period of considerable expansion."],
				["Your depth of comprehension may tend to make you lax in worldly ways."],
				["Your domestic life may be harmonious."],
				["Your fly might be open (but don't check it just now)."],
				["Your goose is cooked. (Your current chick is burned up too!)"],
				["Your heart is pure, and your mind clear, and your soul devout."],
				["Your ignorance cramps my conversation."],
				["Your life would be very empty if you had nothing to regret."],
				["Your love life will be happy and harmonious."],
				["Your love life will be... interesting."],
				["Your lover will never wish to leave you."],
				["Your lucky color has faded."],
				["Your lucky number has been disconnected."],
				["Your lucky number is 3552664958674928.  Watch for it everywhere."],
				["Your mode of life will be changed for the better because of good news soon."],
				["Your mode of life will be changed for the better because of new developments."],
				["Your motives for doing whatever good deed you may have in mind will be misinterpreted by somebody."],
				["Your nature demands love and your happiness depends on it."],
				["Your object is to save the world, while still leading a pleasant life."],
				["Your own qualities will help prevent your advancement in the world."],
				["Your present plans will be successful."],
				["Your reasoning is excellent -- it's only your basic assumptions that are wrong."],
				["Your reasoning powers are good, and you are a fairly good planner."],
				["Your sister swims out to meet troop ships."],
				["Your society will be sought by people of taste and refinement."],
				["Your step will soil many countries."],
				["Your supervisor is thinking about you."],
				["Your talents will be recognized and suitably rewarded."],
				["Your temporary financial embarrassment will be relieved in a surprising manner."],
				["Your true value depends entirely on what you are compared with."]
			]
		},

		refresh: function(force) {
			if (!force && this.config.method == "daily" && this.data.date && (new Date().getTime() - this.data.date) < 864E5) {
				return;
			}

			var source = this.sources[this.config.source];

			if (Array.isArray(source)) {
				var quote = _.sample(source);

				if (Array.isArray(quote)) {
					quote = {
						body: quote[0],
						source: quote[1],
						link: quote[2]
					};

					if (quote.source === 0) {
						quote.source = this.utils.translate("unknown_author");
					}

					if (!quote.link) delete quote.link;
					if (!quote.source) delete quote.source;
				}
				
				this.data = quote;

				this.data.date = new Date().getTime();

				this.render();

				this.utils.saveData(this.data);
			}
			else if (source && source.url && typeof source.parse == "function") {
				$.ajax({
					cache: false,
					method: "GET",
					url: _.result(source, "url"),
					success: function(d) {
						if (d) {
							try {
								var quote = source.parse(d, this.utils.translate("unknown_author"));
							}
							catch (e) {
								var quote = false;
							}

							if (!quote) return;

							if (!quote.link) delete quote.link;
							if (!quote.source) delete quote.source;

							this.data = quote;

							this.data.date = new Date().getTime();

							this.render();

							this.utils.saveData(this.data);
						}
					}.bind(this)
				});
			}
		},


		render: function(demo) {
			if (demo) return this.refresh();

			var data = _.clone(this.data);

			if (this.config.title) {
				data.title = this.config.title;
			}

			$(this.elm).off("click.quotes").on("click.quotes", ".tweet", function(e) {
				e.preventDefault();

				var d = this.data;

				chrome.tabs.create({
					url: "https://twitter.com/intent/tweet?" +
						"text=" + encodeURIComponent(d.noquotes ? d.body : '"' + d.body + '"' + (d.source ? ' — ' + d.source : "")) +
						"&via=iChromeHQ&related=iChromeHQ"
				});
			}.bind(this)).on("click.quotes", "footer .refresh", function(e) {
				e.preventDefault();

				this.refresh(true);
			}.bind(this));

			this.utils.render(data);
		}
	};
});