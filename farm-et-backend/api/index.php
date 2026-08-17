<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Vercel gives us a read-only filesystem. Only /tmp is writable!
// So we must move all Laravel storage directories to /tmp during runtime.
$storage = '/tmp/storage';
if (!is_dir($storage)) {
    mkdir($storage, 0755, true);
    mkdir($storage.'/app/public', 0755, true);
    mkdir($storage.'/framework/cache', 0755, true);
    mkdir($storage.'/framework/views', 0755, true);
    mkdir($storage.'/framework/sessions', 0755, true);
    mkdir($storage.'/logs', 0755, true);
    mkdir($storage.'/bootstrap/cache', 0755, true);
}

// Tell Blade compiler where to write its views
$_ENV['VIEW_COMPILED_PATH'] = $storage.'/framework/views';
putenv("VIEW_COMPILED_PATH={$storage}/framework/views");

// Force Laravel to ignore any stale cached packages from previous Vercel builds
$_ENV['APP_PACKAGES_CACHE'] = $storage.'/bootstrap/cache/packages.php';
putenv("APP_PACKAGES_CACHE={$storage}/bootstrap/cache/packages.php");
$_ENV['APP_SERVICES_CACHE'] = $storage.'/bootstrap/cache/services.php';
putenv("APP_SERVICES_CACHE={$storage}/bootstrap/cache/services.php");

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

// Tell Laravel to use /tmp for all storage paths
$app->useStoragePath($storage);

$_SERVER['SCRIPT_NAME'] = '/index.php';
$app->handleRequest(Request::capture());
