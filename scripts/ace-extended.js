(function($, window, undefined) { // safe scope

    var INPUT_FIELD_CLASS = 'InputfieldAceExtended';

    var DRAG_HITAREA_CLASS_NAME = 'drag-hitarea';
    var DRAGGER_CLASS_NAME = 'dragger';
    var OVERLAY_CLASS_NAME = 'overlay';
    var DRAGGING_BODY_CLASS = 'dragging-ace';
    var DRAGGER_HEIGHT = 6;
    var MIN_ROWS = 3;

    var snapToGrip = function(value, gridSize) {
        return gridSize * Math.ceil(value / gridSize);
    };

    var aceHelper = {
        get: function(editor, $editor, config, id) {

            return {
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

                storage: (function(){
                    return {
                        save: function(name, value) {
                            if (window.localStorage) {
                                localStorage[id + name] = value;
                            }
                        },
                        get: function(name) {
                            if (window.localStorage) {
                                return localStorage[id + name];
                            } else {
                                config[name];
                            }
                        }
                    }
                })(),

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

        var helper = aceHelper.get(editor, $editor, config, id);

        editor.on('change', function() {
            $textarea.val(editor.getValue());
        });


        $.each(['theme','mode','fontSize','rows', 'fontFamily', 'keybinding'], function(index, name) {

            var $el = $wrapper.find('[name=ace-'+name+']');
            var val = helper.storage.get(name) || config[name];
            var ucfName = helper.ucFirst(name);

            $el.on('change', function() {
                var val = $(this).val();
                helper['set'+ucfName](val);
                helper.storage.save(name, val)
                config[name] = val;
            });

            helper['set'+ucfName](val);

            // only save the value to storage if there is
            // an input field in the options menu
            if ($el.length) {
                helper.storage.save(name, val);
            }

            $el.val(val);
            $el.trigger('change');
        });

        var rows = helper.storage.get('rows');
        var lineCount = editor.session.getLength();

        if (rows >= lineCount) {
            rows = lineCount + 1;
            helper.setRows(rows);
            helper.storage.save('rows', rows);
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
                    marginTop: -(DRAGGER_HEIGHT/2),
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

                    $overlay.height(targetPosSnapped - ($dragger.height() / 2));

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
                        helper.storage.save('rows', pos);
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

        var $fields = $('[data-input-class='+INPUT_FIELD_CLASS+']');

        $fields.each(function() {
            var $field = $(this),
                fieldName = $field.data('field-name');
            acefy($field, config[INPUT_FIELD_CLASS][fieldName])
        });
    });

})(jQuery, window);
