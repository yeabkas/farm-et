<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'bem117297@gmail.com')->first();
if ($user) {
    // Because 'password' => 'hashed' is in the casts array, assigning a plaintext string will automatically hash it
    $user->password = 'Passbem117297!';
    $user->save();
    echo "Password reset successfully.";
} else {
    echo "User not found";
}
