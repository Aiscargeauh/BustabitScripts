var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base bet' },
    nbrOfWinStreak: { value: 3, type: 'text', label: 'Win Streak to return to base bet' },
    xAimed : { value: 2, type: 'multiplier', label: 'Multiplier to aim' }
}

//Reverse martingale by @Cannonball
//Feel free to tip, as it is a free script
//Also feel free to ping me if you got questions
//Idea is to bet more after you win, and return to base bet when lost
//After x win, return to base bet to save the profit

var currentWinStreak = 0;
var userProfit = 0;
var currentBet = config.baseBet.value;
var goalReached = 0;
var isBetting = false;

log('FIRST LAUNCH | WELCOME!');

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    log('Betting ' + currentBet/100 + ' bit(s) @ x' + config.xAimed.value + '.');
    engine.bet(currentBet, config.xAimed.value);
    isBetting = true;
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if(isBetting){
        if (!gameInfos.cashedAt) {
            //Lost
            currentWinStreak = 0;
            userProfit -= currentBet;
            currentBet = config.baseBet.value;
            log('Lost...');
        }else{
            //Won
            currentWinStreak++;
            userProfit += currentBet;
            currentBet *= 2;
            log('Won!');
        }
        if(currentWinStreak == config.nbrOfWinStreak.value){
            currentWinStreak = 0;
            currentBet = config.baseBet.value;
            goalReached++;
            log('You reached win streak goal!');
        }
        log('Current profit: ' + userProfit/100 + ' bits. Got the win streak goal ' + goalReached + ' times.');
    }
    log('END GAME');
});