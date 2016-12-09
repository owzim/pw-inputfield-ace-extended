# Inputfield Ace Extended
Version `1.0.3`

A highly configurable and flexible [Ace editor](https://ace.c9.io/) input field for [ProcessWire](http://processwire.com/) `2.5.5+` and `3.0.0+`

This module is sponsored in part by [Nibiri](http://nibiri.com/), aka forum member [Macrura](https://processwire.com/talk/user/136-macrura/).

See this short [Screencast](https://www.youtube.com/watch?v=4Ajiako70iY) to get an overview.

## Usage via API

```php
$ace = $modules->get('InputfieldAceExtended');

$ace->label              = 'An Ace Field';
$ace->name               = 'ace';
$ace->value              = json_encode($someArray, JSON_PRETTY_PRINT);
$ace->collapsed          = Inputfield::collapsedYes;
$ace->rows               = 10;
$ace->enableLocalStorage = false;
$ace->mode               = 'json';
$ace->optionsCollapsed   = Inputfield::collapsedHidden;
$ace->theme              = 'tomorrow';

$ace->setAdvancedOptions(array(
    'highlightActiveLine' => false,
    'showLineNumbers'     => false,
    'showGutter'          => false,
    'tabSize'             => 2,
    'printMarginColumn'   => false,
));

$ace->setExtensionOptions(array(
    'enableEmmet' => true
));
```

## Changelog

- `1.1.3` Expose `$textarea.getAce()` to get the editor instance
- `1.0.0`
    * Use no-conflict version of ace
    * Implement possibility to add built-in extensions, by default [emmet](http://emmet.io/) is enabled
    * Apply PHP code refactoring
- `0.5.0`
    * Enable field to be instantiated via `API`
    * Add interval check on `editor.renderer.lineHeight` and only initialize everything via callback when it is available
    * Add option to enable/disable `localStorage`
    * Make `advancedOptions` use the the Inputfield itself, INCEPTION!
- `0.4.0` Move advanced options into one dimensional hash, rather that in sub objects like `editor`, `session` etc.
- `0.3.0` Add possibility to apply advanced options via JSON string in a separate field setting
- `0.2.0` Add possibility to clear localStorage, add cookie fall-back
- `0.1.0` Initial version

## Roadmap

* Enable [ajax mode](https://processwire.com/blog/posts/new-ajax-driven-inputs-conditional-hooks-template-family-settings-and-more/#new-ajax-driven-inputfields-system-wide)
* Add full screen mode
* Expose a jQuery API for resizing, setting row count etc.
