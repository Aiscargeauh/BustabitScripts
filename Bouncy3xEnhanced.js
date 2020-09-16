var config = {
    noopExample: { type: 'noop', label: 'Base Bet' },
    baseBet: { value: 1500, type: 'balance', label: 'Base bet' },
    redStreak: { value: 5, type: 'number', label: 'Red streak to wait' },
    rushGames: { value: 15, type: 'number', label: 'Games to bet after red streak' }
}

var currentBet = config.baseBet.value;
var redStreakToWait = config.redStreak.value;
var gamesToBetAfterRedStreak = config.rushGames.value;
var currentRedStreak = 0;
var bettedGames = 0;
var isBettingNow = false;
var numberOf3xCashedOut = 0;
var userProfit = 0;
var currentStreakBets = [];

log('FIRST LAUNCH | WELCOME!');

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME');
    log('Profit since starting the script: ' + userProfit / 100 + ' bits. Got ' + numberOf3xCashedOut + ' times 3x.');

    //If the red streak it attained, or we already started betting
    //go bet until we reach gamesToBetAfterRedStreak
    if (currentRedStreak >= redStreakToWait || bettedGames != 0) {
        engine.bet(currentBet, 3);
        bettedGames++;
        currentRedStreak = 0;
        currentStreakBets.push(currentBet);
        log("Betting " + currentBet / 100 + " bits this game.");
        isBettingNow = true;

        //if we made all the games, stop betting after this one
        if (bettedGames == gamesToBetAfterRedStreak) {
            bettedGames = 0;
        }
    } else {
        log("Waiting for red streak of " + redStreakToWait + " games.");
        log("Current red streak: " + currentRedStreak + ".");
        isBettingNow = false;
    }
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (isBettingNow) {
        if (!gameInfos.cashedAt) {
            //Lost
            log('Lost...');
            userProfit -= currentBet;
            if (currentStreakBets.length > 1) {
                currentBet = currentStreakBets[currentStreakBets.length - 1] + currentStreakBets[currentStreakBets.length - 2];
            }
        } else {
            //Won
            log('Won!');
            userProfit += currentBet * 3;
            currentStreakBets = [];
            currentBet = config.baseBet.value;
            numberOf3xCashedOut++;
        }
    } else {
        //red is under 1.98, not 2 (ask shiba !prob 1.98)
        if (gameInfos.bust < 1.98) {
            currentRedStreak++;
        } else {
            currentRedStreak = 0;
        }
    }
    log('END GAME');
});