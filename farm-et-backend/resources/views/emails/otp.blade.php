<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Verify Your Email Address</h2>
    <p>Thank you for signing up for Farm-ET. Please use the following code to verify your email address.</p>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border-radius: 5px; text-align: center;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #10b981;">{{ $otpCode }}</span>
    </div>
    
    <p>This code will expire in 30 minutes.</p>
    <p>If you did not request this code, please ignore this email.</p>
    
    <p>Thanks,<br>
    The Farm-ET Team</p>
</body>
</html>
