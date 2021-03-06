/* global UIhelpers, tuiter, header, timeline */
'use strict';

var compose = compose || {};
(function(window) {

    var ELEM = document.getElementById('compose');

    compose.controller = function() {
        this.text = m.prop('');
        this.image = m.prop(false);

        this.update = function() {
            m.render(ELEM, compose.view(this));
        }.bind(this);

        this.updateStatus = function() {
            var that = this;
            if (this.image()) {
                // todo send image
            } else {
                tuiter.updateStatus(this.text(), null, function(error) {
                    if (error) {
                        window.alert(error);
                    } else {
                        that.text('');
                        m.route('/timeline');
                    }
                });
            }
        }.bind(this);

        UIhelpers.showOnlyThisSection(ELEM);
        m.render(ELEM, compose.view(this));
    };

    compose.view = function(controller) {
        return m('div#comp', [
            m('textarea#compose-area', {
                name: 'compose-area',
                placeholder: 'What do you want to say?',
                oninput: m.withAttr('value', controller.text),
                onkeyup: controller.update
            }),
            m('button#sendbutton', {
                onclick: controller.updateStatus
            }),
            m('span#charsleft', 140 - controller.text().length),
            m('label', [
                m('input#addimage', {
                    type: 'file',
                    name: 'addimage',
                    //value: 'image\/*',
                    placeholder: 'Image'
                }),
                'Add image'
            ])
        ]);
    };
})(window);

