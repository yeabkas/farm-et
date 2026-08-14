<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Registration</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            border-top: 4px solid #10b981;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        h2 {
            color: #111827;
            margin-top: 0;
        }
        p {
            color: #4b5563;
            line-height: 1.6;
        }
        .user-details {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin: 20px 0;
        }
        .user-details strong {
            display: inline-block;
            width: 80px;
            color: #374151;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>New User Registered</h2>
        <p>Hello Admin,</p>
        <p>A new user has just registered on the Farm-ET platform.</p>
        
        <div class="user-details">
            <p><strong>Name:</strong> {{ $newUser->name }}</p>
            <p><strong>Email:</strong> {{ $newUser->email }}</p>
        </div>
        
        <p>You can view their full profile and manage their account from the Platform Admin Console.</p>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Farm-ET. All rights reserved.</p>
            <p>This is an automated administrative notification.</p>
        </div>
    </div>
</body>
</html>
