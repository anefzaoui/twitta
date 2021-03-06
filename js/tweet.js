/* global user, moment, twttr */
'use strict';

var tweet = tweet || {};

(function(window) {
    var userController;

    // Models
    tweet.Tweet = function(tweet) {
        // Lazy initialize
        if (!userController) {
            userController = new user.controller();
        }

        this.id_str = m.prop(tweet.id_str);
        this.created_at = m.prop((new Date(tweet.created_at)).getTime());
        this.text = m.prop(tweet.text);
        this.user = new user.User(tweet.user);
        this.favorite_count = m.prop(tweet.favorite_count);
        this.retweet_count = m.prop(tweet.retweet_count);
        this.in_reply_to_status_id_str = m.prop(tweet.in_reply_to_status_id_str);

        userController.add(this.user);

        // Placeholders
        this.is_retweet = m.prop(false);
        this.media = m.prop(false);

        // this is a RT
        if (tweet.retweeted_status) {
            this.is_retweet = m.prop(true);
            this.orig_id = m.prop(tweet.retweeted_status.id);
            this.retweeted_by_username = m.prop(tweet.user.screen_name);
            this.orig_user = new user.User(tweet.retweeted_status.user);
            this.text = m.prop(tweet.retweeted_status.text);
            userController.add(this.orig_user);
        }

        // This has media
        if (tweet.entities && tweet.entities.media) {
            this.media = m.prop(true);
            this.media_url = m.prop(tweet.entities.media[0].media_url_https);
            this.expanded_url = m.prop(tweet.entities.media[0].expanded_url);
        }

        // Own actions:
        this.retweeted = m.prop(tweet.retweeted);
        this.favorited = m.prop(tweet.favorited);
    };

    tweet.controller = function() {
    };

    var showTweet = function() {
        // This is the id of the tweet
        var nextRoute = '/tweet/' + this;
        m.route(nextRoute);
    };

    tweet.view = function(tweet, extended) {
        function mediaNodes(tweet) {
            if (tweet.media()) {
                return m('a', {
                    href: tweet.expanded_url(),
                    target: '_blank'
                    }, m('img', {src: tweet.media_url()})
                );
            }
        }


        function linkEntities(text) {
            var entities = [];
            // Extract entities with own's twitter library
            entities = twttr.txt.extractEntitiesWithIndices(text);
            if (entities.length === 0) {
                return text;
            }

            //Sort by indice
            entities.sort(function(a, b) {
                return a.indices[0] > b.indices[0];
            });


            var entity;
            var elements = [];
            var index = 0;

            // Generate the virtual DOM with mithril
            while ((entity = entities.shift()) !== undefined) {
                var tmp = text.slice(index, entity.indices[0]);
                if (tmp.length >= 0) {
                    elements.push(tmp);
                }
                if (entity.screenName) {
                    elements.push(m('a', {
                        href: '/user/@' + entity.screenName,
                        config: m.route
                    }, '@' + entity.screenName));
                } else if (entity.hashtag) {
                    elements.push(m('a', {
                        href: '/search/#' + entity.hashtag,
                        config: m.route
                    }, '#' + entity.hashtag));
                } else if (entity.url) {
                     elements.push(m('a', {
                        href: entity.url,
                        target: '_blank'
                    }, entity.url));
                } else {
                    // Cashtags
                    // user/list
                    // we do not care for now so just add the text
                    elements.push(tmp);
                }
                index = entity.indices[1];
            }

            // Add remaining text
            if (index < text.length) {
                elements.push(text.slice(index));
            }

            // Return it
            return elements;
        }

        var ago = moment(tweet.created_at()).fromNow();
        var data = [];
        var u;

        if (tweet.is_retweet()) {
            u = tweet.orig_user;
        } else {
            u = tweet.user;
        }

        var headerData = [];
        headerData.push(m('span.tweet-name',  u.name()));
        headerData.push(m('span.tweet-username', [
            m('a', {
                    href: '/user/' + u.id(),
                    config: m.route
                }, '@' + u.screen_name()),
        ]));
        headerData.push(m('time', {
            datetime: (new Date(tweet.created_at())).toUTCString(),
            class: 'tweet-time-ago'
        }, ago));

        data.push(m('div.tweet-header'), headerData);

        data.push(m('div.tweet-avatar', [
            m('img', {src: u.profile_image_url_https()})
        ]));
        data.push(m('p.tweet-text', linkEntities(tweet.text())));

        if (tweet.is_retweet()) {
            data.push(m('p.tweet-retweeted', 'Retweeted by ' +
                tweet.user.screen_name()));
        }

        data.push(mediaNodes(tweet));

        if (extended) {
            var extended = [];
            extended.push(m('div.favorite-count', tweet.favorite_count()));
            extended.push(m('div.retweet-count', tweet.retweet_count()));
            extended.push(m('div.own-favorite', tweet.favorited()));
            data.push(m('div#extended-data', extended));
        }

        return m('div', {
            id: tweet.id_str(),
            class: 'tweet',
            onclick: showTweet.bind(tweet.id_str())
        }, data);
    };
})(window);
