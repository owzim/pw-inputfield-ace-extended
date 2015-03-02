# Inputfield ACE Extended
Version `0.12.x`

A highly configurable and flexible ACE editor input field for [ProcessWire 2.5.5](http://processwire.com/)

This module is sponsored in part by [Nibiri](http://nibiri.com/), aka forum member [Macrura](https://processwire.com/talk/user/136-macrura/).

See this short [Screencast](https://www.youtube.com/watch?v=4Ajiako70iY) to get an overview.

## Usage via API

```PHP
$ace = $modules->get('InputfieldAceExtended');

$ace->label              = 'An ACE Field';
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

**0.6.x - 0.12.x**

* use noconflict version of ace
* implement possibility to add built-in extensions, by default [emmet](http://emmet.io/) is enabled
* apply major PHP code refactoring

**0.5.x**

* enable field to be instantiated via `API`
* add interval check on `editor.renderer.lineHeight` and only initalize everything via callback when it is available
* add option to enable/disable `localStorage`
* make `advancedOptions` use the the Inputfield itself, INCEPTION!

**0.4.x** move advanced options into one dimensional hash, rather that in sub objects like `editor`, `session` etc.

**0.3.x** add possibility to apply advanced options via json string in a separate field setting

**0.2.x** add possibility to clear localStorage, add cookie fallback

**0.1.0** initial version

## Roadmap

* add full screen mode
* expose a jQuery api for resizing, setting row count etc.
* add image handling like in [Adam Kiss' version](https://processwire.com/talk/topic/2277-stable-version-the-ace-editor-your-new-favorite-inputfield/?p=21948)
