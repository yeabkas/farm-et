<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);

$request = Request::create('/api/register', 'POST', [
    'name' => 'Adane Delessa',
    'email' => 'bem81462@gmail.com',
    'password' => 'Password123!',
    'password_confirmation' => 'Password123!',
]);

$response = $kernel->handle($request);
echo $response->getContent();
