var config = {
    noopExample: { type: 'noop', label: 'Base Bet' },
    baseBet: { value: 1500, type: 'balance', label: 'Base bet' },
    redStreak: { value: 5, type: 'number', label: 'Games under 3 to wait' },
    maxBet: { value: 10000, type: 'balance', label: 'Max bet before restarting' }
}

var currentBet = config.baseBet.value;
var redStreakToWait = config.redStreak.value;
//RED STREAK IS UNDER 3 IN THIS SCRIPT
var currentRedStreak = 0;
var bettedGames = 0;
var isBettingNow = false;
var numberOf3xCashedOut = 0;
var startingBalance = userInfo.balance;
var userProfit = 0;
var currentStreakBets = [];

log('FIRST LAUNCH | WELCOME!');

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME');
    log('Profit since starting the script: ' + (userInfo.balance - startingBalance) / 100 + ' bits. Got ' + numberOf3xCashedOut + ' times 3x.');

    //If the red streak it attained, or we already started betting
    //go bet until we reach gamesToBetAfterRedStreak
    if (currentRedStreak >= redStreakToWait || bettedGames != 0) {
        engine.bet(currentBet, 3);
        bettedGames++;
        currentRedStreak = 0;
        currentStreakBets.push(currentBet);
        log("Betting " + currentBet / 100 + " bits this game.");
        isBettingNow = true;
    } else {
        log("Waiting for streak of " + redStreakToWait + " games under 3x.");
        log("Current streak: " + currentRedStreak + ".");
        isBettingNow = false;
    }
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (isBettingNow) {
        if (!gameInfos.cashedAt) {
            //Lost
            log('Lost...');
            if (currentStreakBets.length > 1) {
                let tempBetAmount = currentStreakBets[currentStreakBets.length - 1] + currentStreakBets[currentStreakBets.length - 2];
                if(tempBetAmount > (config.maxBet.value)){
                    log("Resetting bets! Starting over...");
                    currentStreakBets = [];
                    currentBet = config.baseBet.value;
                }else{
                    currentBet = tempBetAmount;
                }
            }
        } else {
            //Won
            log('Won!');
            currentStreakBets = [];
            currentBet = config.baseBet.value;
            numberOf3xCashedOut++;
            bettedGames = 0;
        }
    }
    //RED STREAK IS UNDER 3 FOR THIS SCRIPT
    if (gameInfos.bust < 3) {
        currentRedStreak++;
    } else {
        currentRedStreak = 0;
    }
    log('END GAME');
});