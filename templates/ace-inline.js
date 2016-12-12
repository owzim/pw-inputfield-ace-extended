(function($, w, namespace) {
    var fieldName = '{{name}}',
        inputfieldName = 'Inputfield_' + fieldName,
        field, module;

    if (!w[namespace]) w[namespace] = { fields: {} };
    module = w[namespace];

    field = module.fields[inputfieldName] = {
        options: {{jsOptions}}
    };

    if (!{{ajax}}) return;

    if (typeof module.initFields === 'function') {

        // module.initFields exists, meaning the module script
        // is already loaded by another field,
        // so call it
        module.initFields();
    } else {
        var $body = $('body'), $head = $('head');

        // module.initFields does not exist, meaning the module script has not
        // been loaded by the page or another module
        // so load all scripts and styles
        $({{scripts}}).each(function(i, url) {
            $body.append($('<script>').attr({
                type : 'text/javascript',
                src  : url
            }));
        });

        $({{styles}}).each(function(i, url) {
            $head.append($('<link>').attr({
                type : 'text/css',
                href : url,
                rel  : 'stylesheet'
            }));
        });
    }
})(jQuery, window, 'INPUTFIELD_ACE_EXTENDED');
