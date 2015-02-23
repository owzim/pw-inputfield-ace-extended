<?php

require_once(__DIR__ . '/../owzim/InputfieldAceExtended/Autoloader.php');
spl_autoload_register('\owzim\InputfieldAceExtended\Autoloader::autoload');

class InputfieldAceExtendedTests extends \TestFest\TestFestSuite {

    protected static function T($name) {
        return "\\owzim\\InputfieldAceExtended\\{$name}";
    }

    function init() {
        $this->src = __DIR__ . '/src';
    }

    function getSrc($filename) {
        return file_get_contents("$this->src/{$filename}");
    }


}
