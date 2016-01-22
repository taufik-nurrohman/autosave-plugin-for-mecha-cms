<?php

// Load the configuration data
$autosave_config = File::open(__DIR__ . DS . 'states' . DS . 'config.txt')->unserialize();

define('AUTOSAVE_INTERVAL', $autosave_config['interval']);

Config::merge('DASHBOARD.languages', array('plugin_autosave' => $speak->plugin_autosave));

Weapon::add('shell_after', function() {
    echo Asset::stylesheet(__DIR__ . DS . 'assets' . DS . 'shell' . DS . 'do.css');
});

Weapon::add('SHIPMENT_REGION_BOTTOM', function() {
    echo Asset::javascript(__DIR__ . DS . 'assets' . DS . 'sword' . DS . 'do.js');
});

// Update configuration data
Route::accept($config->manager->slug . '/plugin/' . File::B(__DIR__) . '/update', function() use($config, $speak) {
    if($request = Request::post()) {
        Guardian::checkToken($request['token']);
        File::write($request['css'])->saveTo(__DIR__ . DS . 'assets' . DS . 'shell' . DS . 'do.css');
        unset($request['token'], $request['css']);
        File::serialize($request)->saveTo(__DIR__ . DS . 'states' . DS . 'config.txt', 0600);
        Notify::success(Config::speak('notify_success_updated', $speak->plugin));
        Guardian::kick(File::D($config->url_current));
    }
});