<!DOCTYPE html>
<html>
<head>
    <title>Auction Ended</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Auction Concluded</h2>
    <p>Hello,</p>
    <p>An auction has just ended.</p>
    @if($role === 'winner')
        <p>Congratulations! You won the auction with a bid of <strong>ETB {{ number_format($auction->highestBid->amount, 2) }}</strong>.</p>
        <p>Please contact the seller at {{ $auction->user->email }} to arrange payment and delivery.</p>
    @else
        <p>Your auction has concluded. The winning bid is <strong>ETB {{ number_format($auction->highestBid->amount, 2) }}</strong>.</p>
        <p>Please contact the winner at {{ $auction->highestBid->user->email }} to arrange payment and delivery.</p>
    @endif
</body>
</html>
