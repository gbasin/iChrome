define(["backbone", "lodash", "jquery", "lib/parseurl", "browser/api", "lib/cryptojs"], function(Backbone, _, $, parseUrl, Browser, CryptoJS) {
    if (window.feedlyProxySingleton) {
        return window.feedlyProxySingleton;
    };

    function createFeedlyProxy() {
        var that = this;

        this.timeQueueSize = 60;

        var load = function() {
            var queue = null;
            try {
                queue = JSON.parse(Browser.storage.rssqueue || "null");
            }
            catch(e) {};

            if (!queue) {
                queue = {
                    buffer: null,
                    pointer: 0,
                    expectedAt: 0
                };
            }

            if (!queue.buffer || queue.buffer.length != that.timeQueueSize) {
                queue.buffer = new Array(that.timeQueueSize).fill(0);
                queue.pointer = 0;
            }

            return queue;
        }.bind(this);

        var save = function(queue) {
            Browser.storage.rssqueue = JSON.stringify(queue);
        };

        var queueObject = function(queue, length) {
            return {
                delayMs: function() {
                    var last = this.get();
                    if (!last || last === 0) {
                        return 0;
                    };
        
                    var result = new Date().getTime() - last;
                    return result < 0 ? 0 : result;
                },
        
                get: function() {
                    return queue.buffer[queue.pointer === 0 ? (length - 1) : (queue.pointer - 1)];
                },
                
                push: function() {
                    queue.buffer[queue.pointer] = new Date().getTime();
                    queue.pointer = (length + queue.pointer + 1) % length;
                }, 

                calculateDelay: function(isUrgent) {
                    var now = new Date().getTime();
                    var delay = this.delayMs();
                    if (queue.expectedAt === 0) {
                        queue.expectedAt = now;
                        return delay;
                    }
        
                    var nextTime = now + delay;
                    if (nextTime > queue.expectedAt) {
                        queue.expectedAt = nextTime;
                        return delay;
                    }
        
                    var minIntervalMs = 1000;
                    if (!isUrgent) {
                        //Dynamically calculate the recommended delay depending on requests number during last hour
                        var oneHourAgo = now - 3600000;
                        var lastHourRequests = 0;
                        queue.buffer.forEach(function(i) { 
                            if  (i > oneHourAgo) {
                                lastHourRequests++;
                            }
                        });

                        if (lastHourRequests > length) {
                            minIntervalMs = 10 * 60 * 1000;
                        } else if (lastHourRequests > length * 0.9) {
                            minIntervalMs = 5 * 60 * 1000;
                        } else if (lastHourRequests > length * 0.75) {
                            minIntervalMs = 1 * 60 * 1000;
                        } else if (lastHourRequests > length * 0.5) {
                            minIntervalMs = 30 * 1000;
                        } else if (lastHourRequests > length * 0.3) {
                            minIntervalMs = 5 * 1000;
                        } else if (lastHourRequests > length * 0.1) {
                            minIntervalMs = 2 * 1000;
                        } 
                    }
        
                    nextTime = queue.expectedAt + minIntervalMs;
                    queue.expectedAt = nextTime;
                    delay = queue.expectedAt - now;
                    return delay < 0 ? 0 : delay;
                }
            };
        }

        var makeFilename = function(url) {
			return CryptoJS.SHA1(url).toString(CryptoJS.enc.Base64);
        };

        this.getCached = function(url) {
            var data = JSON.parse(Browser.storage.rssc || "{}");
            var now = new Date().getTime();            
            var shouldSave = false;
            for (prop in data) {
                var expireAt = data[prop];
                if (expireAt < now) {
                    Browser.storage.removeItem("rssu" + prop);
                    delete data[prop];          
                    shouldSave = true;
                }
            }
    
            if (shouldSave) {
                Browser.storage.rssc = JSON.stringify(data);
            }

            var hash = makeFilename(url);

            if (data[hash]) {
                return JSON.parse(Browser.storage.getItem("rssu" + hash) || "null");
            }

            return null;
        };

        var saveCached = function(items, url, time) {
            var data = JSON.parse(Browser.storage.rssc || "{}");
            var hash = makeFilename(url);
            data[hash] = time;
            Browser.storage.rssc = JSON.stringify(data);
            Browser.storage.setItem("rssu" + hash, JSON.stringify(items));
        };         

        this.onsent = function(data, url, time) {
            var queueData = load();
            queueObject(queueData, that.timeQueueSize).push();
            save(queueData);

            saveCached(data, url, time);
        };

        this.getDelay = function(isUrgent) {
            var queueData = load();
            var delay = queueObject(queueData, that.timeQueueSize).calculateDelay(isUrgent);
            save(queueData);
            return delay;
        };
        
        return this;
    };

    window.feedlyProxySingleton = createFeedlyProxy();
    return window.feedlyProxySingleton;
});