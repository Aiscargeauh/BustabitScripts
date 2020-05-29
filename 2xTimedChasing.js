var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base bet' },
    redStreakToWait: { value: 10, type: 'text', label: 'Red games to wait before making a bet' },
    minutesToBetOn: { value: 15, type: 'text', label: 'Minutes to bet after a streak has been seen'}
}

//2x chasing script by @Cannonball
//Feel free to tip, as is it a free script
//Also feel free to ping me if you got questions
//Will bet after the input streak to bet during the input minutes
//->Will wait for the red streak (from input)
//-->Will double the bet every game lost
//Has a history feature, will check the current number of red games when starting the script to bet accordingly
//Has a simulation feature, will calculate how many games without green you can handle before busting your bankroll
//Has logging functionalities, press F12

var biggestBet = 0;
var currentRedStreak = GetCurrentRedStreak();
var gamesTheBotCanHandle = CalculateBotSafeness(config.baseBet.value, config.redStreakToWait.value);
var userProfitInSatoshis = 0;
var numberOf2xCashedOut = 0;
var currentBetInSatoshis = config.baseBet.value;
var isBettingNow = false;
var gamesToBeSafy = 25;
var minutesLeft = 0;
var startingStreakDate = null;

log('FIRST LAUNCH | WELCOME!');
log('Bot safety check :');
log('-> You can manage to loose a ' + gamesTheBotCanHandle + ' red streak.');
log('-> The maximum bet would be: ' + biggestBet/100 + ' bits.');
log('-> We do assume 25 games is the maximum streak without 2x so...');
if (gamesTheBotCanHandle >= gamesToBeSafy) {
    log('--> It looks safe with your parameters, let\'s go!');
} else {
    log('--> Please stay around, it\'s not really safe with your parameters, chances to bust are quite high...');
}
log('There is a streak of ' + currentRedStreak + " red games now.");

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    log('Games since no 2x: ' + currentRedStreak + '. You can handle: ' + gamesTheBotCanHandle + ' games without 2x.');
    log('Actual profit using the script: ' + userProfitInSatoshis / 100 + ' bits. Got ' + numberOf2xCashedOut + ' times 2x.');
    if (currentRedStreak >= config.redStreakToWait.value || minutesLeft > 0) {
        //do place bet
        let nowDate = Date.now();
        registerDate(nowDate);
        updateMinutesLeft(nowDate);
        if(minutesLeft > 0){
            log('Will continue to bet for the next ' + minutesLeft + ' minutes.')
            engine.bet(currentBetInSatoshis, 2);
            let currentBetInBits = currentBetInSatoshis / 100;
            let wantedProfit = currentBetInBits + (userProfitInSatoshis / 100);
            log('Betting ' + currentBetInBits + ' right now, looking for ' + wantedProfit + ' bits total profit.')
            isBettingNow = true;
        }else{
            isBettingNow = false;
        }
    } else {
        isBettingNow = false;
        let calculatedGamesToWait = config.redStreakToWait.value - currentRedStreak;
        if (calculatedGamesToWait <= 1) {
            log('Betting ' + config.baseBet.value / 100 + 'bit(s) next game (if this one is red)!');
        } else {
            log('Waiting for ' + calculatedGamesToWait + ' more games with no 2x');
        }
    }
})

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (isBettingNow) {
        if (!gameInfos.cashedAt) {
            userProfitInSatoshis -= currentBetInSatoshis;
            currentBetInSatoshis *= 2;
        } else if (gameInfos.cashedAt) {
            numberOf2xCashedOut++;
            userProfitInSatoshis = userProfitInSatoshis + currentBetInSatoshis;
            currentBetInSatoshis = config.baseBet.value;
        }
    }
    if (gameInfos.bust > 2) {
        currentRedStreak = 0;
    } else {
        currentRedStreak++;
    }
    log('END GAME');
})

function CalculateBotSafeness(baseBetForBot, gamesToWaitForBot) {
    //15:41 Cannonball: !streak < 2
    //15:41  Shiba: Seen 20 streak in games #2684941 - #2684960: 1.07x, 1.31x, 1.64x, 1.27x, 1x, 1.14x, 1.81x, 1.52x... (178,392 games ago, 1M 15d 11h 48m 19s ago)
    //Let's assume if we can handle 25 games, we're safe
    //And let's simulate

    let totalGames = gamesToWaitForBot;
    let brInSatoshis = userInfo.balance;
    let nextBet = baseBetForBot;
    let broken = false;
    let totalBet = 0;

    while (!broken) {
        brInSatoshis -= nextBet;
        totalGames++;
        totalBet += nextBet;
        biggestBet = nextBet;
        nextBet *= 2;
        if (nextBet > brInSatoshis) {
            broken = true;
        }
    }
    return totalGames;
}

function GetCurrentRedStreak() {
    let gamesArray = engine.history.toArray();
    let generatedRedStreak = 0;

    for (var i = 0; i < gamesArray.length; i++) {
        if (gamesArray[i].bust >= 2) {
            break;
        }
        generatedRedStreak++;
    }
    return generatedRedStreak;
}

function updateMinutesLeft(currentDate){

    if(startingStreakDate && minutesLeft > 0){
        minutesLeft = config.minutesToBetOn.value - Math.floor(((currentDate - startingStreakDate) / 1000) / 60);
    }
    if(minutesLeft == 0){
        startingStreakDate = null;
    }
}

function registerDate(currentDate){
    if(!startingStreakDate){
        startingStreakDate = currentDate;
        minutesLeft = config.minutesToBetOn.value;
    }
}