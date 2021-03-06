/* global UIhelpers, tuiter */

'use strict';

var user = user || {};
(function(window) {

    var ELEM = document.getElementById('userprofile');

    // Models
    user.User = function(user) {
        this.id = m.prop(user.id_str);
        this.description = m.prop(user.description);
        this.location = m.prop(user.location);
        this.name = m.prop(user.name); //long name: Guillermo López
        this.screen_name = m.prop(user.screen_name); // username: willyaranda
        this.url = m.prop(false);
        if (user.entities && user.entities.url &&
            user.entities.url.urls && user.entities.url.urls[0] &&
            user.entities.url.urls[0].expanded_url) {
            this.url(user.entities.url.urls[0].expanded_url);
        }
        this.verified = m.prop(user.verified);
        this.profile_image_url_https = m.prop(user.profile_image_url_https);
        this.profile_background_tile = m.prop(user.profile_background_tile);
        this.profile_background_image_url_https =
            m.prop(user.profile_background_image_url_https);
        this.statuses_count = m.prop(user.statuses_count);
        this.friends_count = m.prop(user.friends_count);
        this.followers_count = m.prop(user.followers_count);
        this.protected = m.prop(user.protected);
        this.following = m.prop(user.following);
    };

    var userList = [];

    // Controller
    user.controller = function() {
        this.add = function(u) {
            if (this.findById(u.id())) { return; }
            userList.push(u);
        }.bind(this);

        this.findById = function(id) {
            var foundValue;
            for (var i = 0; i < userList.length; i++) {
                var el = userList[i];
                if (el.id() === id) {
                    foundValue = el;
                    break;
                }
            }
            return foundValue;
        };

        this.findByScreenName = function(screen_name) {

            function normalizeScreenName(sn) {
              var name = (sn[0] === '@') ? sn.slice(1) : sn;
              return name;
            }

            screen_name = normalizeScreenName(screen_name);
            var foundValue;
            for (var i = 0; i < userList.length; i++) {
                var el = userList[i];
                if (el.screen_name() === screen_name) {
                    foundValue = el;
                    break;
                }
            }
            return foundValue;
        };

        var id = m.route.param('id');
        this.u = null;

        if (!id) { m.route('/timeline'); return; }

        var isId_str = !isNaN(id);

        // We have been called with screen_name
        if (!isId_str) {
            this.u = this.findByScreenName(id);
        }
        // Called with id_str
        else {
            this.u = this.findById(id);
        }
        if (!this.u) {
            var id_str;
            var screen_name;
            var that = this;
            if (isId_str) {
                id_str = id;
            } else {
                screen_name = id;
            }
            tuiter.getUserShow(id_str, screen_name, {}, function(error, data) {
                if (error) {
                    console.error(error);
                    m.route('/');
                    return;
                }
                var u = new user.User(data);
                that.add(u);
                that.u = u;
                UIhelpers.showOnlyThisSection(ELEM);
                m.render(ELEM, user.view(that));
            });
        } else {
            UIhelpers.showOnlyThisSection(ELEM);
            m.render(ELEM, user.view(this));
        }
    };

    // View
    user.view = function(ctrl) {
        var u = ctrl.u;
        var data = [];
        if (!u) {
            return;
        }
        if (u.profile_background_tile()) {
            data.push(m('img', {
                src: ctrl.u.profile_background_image_url_https()
            }));
        }
        data.push(m('img', {
            src: u.profile_image_url_https()
        }));
        data.push(m('span', 'ver' + u.verified()));
        data.push(m('p', '@' + u.screen_name()));
        data.push(m('p', u.name()));
        data.push(m('p', u.description()));
        data.push(m('p', u.location()));
        if (u.url()) {
            data.push(m('p', [
                m('a', {href: u.url(), target: '_blank'}, u.url())
            ]));
        }
        data.push(m('p', 'prot' + u.protected()));
        data.push(m('p', 'fol?' + u.following()));
        data.push(m('p', 'tw' + u.statuses_count()));
        data.push(m('p', 'fr' + u.friends_count()));
        data.push(m('p', 'foll' + u.followers_count()));
        return m('div', data);
    };

})(window);
