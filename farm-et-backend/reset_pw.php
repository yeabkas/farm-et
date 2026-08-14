<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::where('email', 'bem117297@gmail.com')->first();
if ($user) {
    // Because 'password' => 'hashed' is in the casts array, assigning a plaintext string will automatically hash it
    $user->password = 'Passbem117297!';
    $user->save();
    echo 'Password reset successfully.';
} else {
    echo 'User not found';
}
