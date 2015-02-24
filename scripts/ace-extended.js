// localStorage fallback with cookies
window.localStorage||Object.defineProperty(window,"localStorage",new function(){var a=[],b={};Object.defineProperty(b,"getItem",{value:function(a){return a?this[a]:null},writable:!1,configurable:!1,enumerable:!1}),Object.defineProperty(b,"key",{value:function(b){return a[b]},writable:!1,configurable:!1,enumerable:!1}),Object.defineProperty(b,"setItem",{value:function(a,b){a&&(document.cookie=escape(a)+"="+escape(b)+"; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/")},writable:!1,configurable:!1,enumerable:!1}),Object.defineProperty(b,"length",{get:function(){return a.length},configurable:!1,enumerable:!1}),Object.defineProperty(b,"removeItem",{value:function(a){a&&(document.cookie=escape(a)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/")},writable:!1,configurable:!1,enumerable:!1}),this.get=function(){var c;for(var d in b)c=a.indexOf(d),-1===c?b.setItem(d,b[d]):a.splice(c,1),delete b[d];for(a;a.length>0;a.splice(0,1))b.removeItem(a[0]);for(var e,f,g=0,h=document.cookie.split(/\s*;\s*/);g<h.length;g++)e=h[g].split(/\s*=\s*/),e.length>1&&(b[f=unescape(e[0])]=unescape(e[1]),a.push(f));return b},this.configurable=!1,this.enumerable=!0});

(function($, window, undefined) { // safe scope

    /**
     * Storage
     *
     * @param {string} namespace
     * @param {object} config
     */
    var Storage = function(namespace, config) {

        this.namespace = namespace;
        this.config = config;

        this.set = function(name, value) {
            var values = this.getAll();
            values[name] = value;
            this.setAll(values);
        };

        this.get = function(name) {
            var values = this.getAll();
            return values[name] || this.config[name];
        };

        this.getAll = function() {
            var values;
            if (localStorage[this.namespace]) {
                values = JSON.parse(localStorage.getItem(this.namespace));
            } else {
                values = {};
            }
            return values;
        };

        this.setAll = function(values) {
            return localStorage.setItem(this.namespace, JSON.stringify(values));
        };

    };

    /**
     * clearAll
     *
     * @param  {string} namespace
     */
    Storage.clearAll = function(namespace) {
        if (namespace) {
            // static
            localStorage.clear(namespace);
        } else {
            // instance
            localStorage.clear(this.namespace);
        }
    };

    Storage.has = function(namespace) {
        return localStorage.getItem(namespace) ? true : false;
    };

    var CLEAR_LOCAL_STORAGE_DATA_KEY = 'clear-local-storage';
    var CLEAR_LOCAL_STORAGE_BUTTON_SELECTOR = '#ace-clear-local-storage';

    var INPUT_FIELD_CLASS = 'InputfieldAceExtended';

    var DRAG_HITAREA_CLASS_NAME = 'drag-hitarea';
    var DRAGGER_CLASS_NAME = 'dragger';
    var OVERLAY_CLASS_NAME = 'overlay';
    var DRAGGING_BODY_CLASS = 'dragging-ace';
    var DRAGGER_HEIGHT = 6;
    var MIN_ROWS = 3;

    var ACE_FIELDS_SELECTOR = '[data-input-class='+INPUT_FIELD_CLASS+']';
    var FIELD_NAME_DATA_KEY = 'field-name';

    var snapToGrip = function(value, gridSize) {
        return gridSize * Math.ceil(value / gridSize);
    };

    var aceHelper = {
        get: function(editor, $editor, config, storage) {

            return {
                storage: storage,
                setFontSize: function(size) {
                    size = parseInt(size);
                    editor.setFontSize(size);
                    this.setRows(this.storage.get('rows'));
                },
                setRows: function(rows) {
                    var lineHeight = this.getLineHeight();
                    var fontSize = parseInt($editor.css('font-size'));

                    $editor.height(Math.ceil(lineHeight * rows));
                    editor.resize();
                },
                setTheme: function(theme) {
                    editor.setTheme("ace/theme/" + theme);
                },
                setMode: function(mode) {
                    editor.getSession().setMode("ace/mode/" + mode);
                },

                setFontFamily: function(fontFamily) {
                    editor.setOptions({
                        fontFamily: fontFamily
                    });
                },

                setKeybinding: function(keybinding) {
                    var originalBinding = editor.getKeyboardHandler();
                    if(keybinding && keybinding !== 'ace') {
                        editor.setKeyboardHandler('ace/keyboard/' + keybinding);
                    }
                },

                getLineHeight: function(realHeight) {

                    var $line = $editor.find('.ace_line');

                    // this fixes a rounding issue on firefox
                    if (typeof window.getComputedStyle !== "undefined") {
                        return parseFloat(window.getComputedStyle($line[0]).height);
                    } else {
                        return $line.height();
                    }

                },

                ucFirst: function(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }
            };
        }
    }

    var acefy = function($wrapper, config) {

        var $placeHolder = $wrapper.find('.ace-editor');

        var id = $placeHolder.attr('id');
        var $textarea = $wrapper.find('textarea');

        $placeHolder.text($textarea.val());

        var editor = ace.edit(id);
        var $editor = $wrapper.find('.ace_editor');

        var storage = new Storage(id, config);
        var helper = aceHelper.get(editor, $editor, config, storage);

        editor.on('change', function() {
            $textarea.val(editor.getValue());
        });

        $.each(['theme','mode','fontSize','rows', 'fontFamily', 'keybinding'], function(index, name) {

            var $el = $wrapper.find('[name=ace-'+name+']');
            var val = storage.get(name);
            var ucfName = helper.ucFirst(name);

            $el.on('change', function() {
                var val = $(this).val();
                helper['set'+ucfName](val);
                storage.set(name, val)
                config[name] = val;
            });

            helper['set'+ucfName](val);

            // only save the value to storage if there is
            // an input field in the options menu
            if ($el.length) {
                storage.set(name, val);
            }

            $el.val(val);
            $el.trigger('change');
        });

        var rows = storage.get('rows');
        var lineCount = editor.session.getLength();

        if (rows >= lineCount) {
            rows = lineCount + 1;
            helper.setRows(rows);
            storage.set('rows', rows);
        }


        // TODO: refactor this, not pretty
        (function() { // safe scope
            "use strict";

            var $dragHitarea = $("<div></div>")
                .addClass(DRAG_HITAREA_CLASS_NAME)
                .height(DRAGGER_HEIGHT);
            var $dragger = $("<div></div>")
                .addClass(DRAGGER_CLASS_NAME)
                .height(DRAGGER_HEIGHT).css({
                    marginTop: (-(DRAGGER_HEIGHT)) + "px",
                    position: 'fixed'
                });

            var $overlay = $("<div></div>")
                .addClass(OVERLAY_CLASS_NAME).css({
                    position: 'fixed',
                    width: "100%",
                    height: "100%"
                });

            $placeHolder.append($dragHitarea);
            $placeHolder.append($dragger);
            $placeHolder.append($overlay);

            var draggerPos = 0;
            var lineHeight = helper.getLineHeight();

            var getMousePos = function($hitarea, e) {
                var hitareaOffset = $hitarea.offset();
                var relX = e.pageX - hitareaOffset.left;
                var relY = e.pageY - hitareaOffset.top;

                hitareaOffset.left = parseInt(hitareaOffset.left);
                hitareaOffset.top = parseInt(hitareaOffset.top);

                var areaFixedTop = parseInt($placeHolder.offset().top - $(window).scrollTop());

                var areaHeight = parseInt($placeHolder.height() - $dragHitarea.height());
                var areaWidth = $placeHolder.width();

                var targetPos = parseInt(areaHeight + relY) - ($dragger.height() / 2);
                var targetPosSnapped = snapToGrip(targetPos, lineHeight);
                var targetPosSnappedInRows = targetPosSnapped / lineHeight;

                if (targetPosSnappedInRows >= MIN_ROWS) {
                    $dragger.css({
                        top: parseInt(areaFixedTop + targetPosSnapped) + "px",
                        left: parseInt(hitareaOffset.left) + "px",
                        width: areaWidth  + "px"
                    });

                    $overlay.css({
                        top: parseInt(areaFixedTop) + "px",
                        left: parseInt(hitareaOffset.left) + "px",
                        width: areaWidth  + "px"
                    });

                    $overlay.height(targetPosSnapped - DRAGGER_HEIGHT);

                    if (targetPosSnapped != 0) {
                        draggerPos = targetPosSnapped;
                    }
                }


            }

            var util = {
                off: function() {

                    $('body').removeClass(DRAGGING_BODY_CLASS);

                    if (draggerPos) {
                        var pos = draggerPos / helper.getLineHeight();

                        helper.setRows(pos);
                        storage.set('rows', pos);
                    }

                    $overlay.hide();
                    $overlay.css({
                        width: 0,
                        height: 0
                    });
                    $dragger.hide();
                    $dragger.css({top: (-$dragger.height()) + "px" });

                },
                on: function() {
                    $('body').addClass(DRAGGING_BODY_CLASS);
                    $dragger.show();
                    $overlay.show();
                    lineHeight = helper.getLineHeight();
                }
            }

            util.off();


            (function() { // mouse events
                "use strict";

                var isDown = false;

                $dragHitarea.on('mousedown', function() {
                    isDown = true;
                });

                $(window).on('mouseup', function() {
                    if (isDown) {
                        isDown = false;
                        util.off();
                    }
                });

                $(window).on('mousemove', function(e) {
                    if (isDown) {
                        util.on();
                        getMousePos($dragHitarea, e);
                    }
                });
            })();
        })();
    };

    $(function() { // dom loaded

        $(CLEAR_LOCAL_STORAGE_BUTTON_SELECTOR).each(function() {

            var $button = $(this);
            var fieldName = $button.data(CLEAR_LOCAL_STORAGE_DATA_KEY);

            if (!Storage.has(fieldName)) {
                $button.attr('disabled', 'disabled').css({opacity: 0.4});
            }

            $button.on('click', function(evt) {
                evt.preventDefault();
                Storage.clearAll(fieldName);
                $button.attr('disabled', 'disabled').css({opacity: 0.4});
            });
        });

        var $fields = $(ACE_FIELDS_SELECTOR);

        $fields.each(function() {
            var $field = $(this),
                fieldName = $field.data(FIELD_NAME_DATA_KEY);
            acefy($field, config[INPUT_FIELD_CLASS][fieldName])
        });
    });
})(jQuery, window);
