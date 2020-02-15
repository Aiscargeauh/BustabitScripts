var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
    gamesToWait: { value: 3000, type: 'text', label: 'Games to wait before making a bet' }
}

//Just a nyan chasing script
//Double the bet after the first 1000 games, then each 500 games

var baseBet = config.baseBet.value;
var isBetting = false;
var userProfit = 0;
var nyansChased = 0;
var looseStreak = 0;
var biggestBet = 0;
var gamesToBeSafy = 7500;
var gamesWithoutNyan = 0;
var isBettingNow = false;


var gamesTheBotCanHandle = CalculateBotSafeness(baseBet, config.gamesToWait.value);
log('FIRST LAUNCH | WELCOME!');
log('Bot safety check :');
log('-> You can manage to loose ' + gamesTheBotCanHandle + ' games without nyan before busting to zero');
log('-> With the maximum bet: ' + biggestBet / 100 + 'bits.');
if (gamesTheBotCanHandle >= gamesToBeSafy) {
    log('--> It looks safe with your parameters, let\'s go!');
} else {
    log('--> Please stay around, it\'s not really safe with your parameters, chances to bust are quite high...');
}


engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    if (gamesWithoutNyan > config.gamesToWait.value) {
        engine.bet(baseBet, 1000); //NYAAAN
        let currentBetInBits = baseBet / 100;
        let wantedProfit = (currentBetInBits * 999) + (userProfit / 100);
        log('Betting ' + currentBetInBits + ' right now, looking for ' + wantedProfit + ' bits total profit.')
        isBettingNow = true;
    } else {
        isBettingNow = false;
        let calculatedGamesToWait = config.gamesToWait.value - gamesWithoutNyan;
        if (calculatedGamesToWait == 0) {
            log('Betting ' + baseBet / 100 + 'bit(s) next game!');
        } else {
            log('Waiting for ' + calculatedGamesToWait + ' more games with no nyan');
        }
    }
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (isBettingNow) {
        if (!gameInfos.cashedAt) {
            //Lost
            log('Lost...');
            if (looseStreak == 1000) {
                baseBet *= 2;
            } else if (looseStreak > 1000 && looseStreak % 500 == 0) {
                baseBet *= 2;
            }
            userProfit -= baseBet;
        } else {
            //Won
            log('Won!');
            userProfit += baseBet;
            looseStreak = 0;
            baseBet = config.baseBet.value;
            nyansChased++;
        }
    }
    if (gameInfos.bust > 1000) {
        gamesWithoutNyan = 0;
    } else {
        gamesWithoutNyan++;
    }
    log('Current profit: ' + userProfit / 100 + ' bits. Got ' + nyansChased + ' nyans!');
    log('END GAME');
});

function CalculateBotSafeness(baseBetForBot, gamesToWaitForBot) {
    //22:42 Cannonball: !streak < 1000
    //22:42  Shiba: Seen 6729 streak in games #710068 - #716796: 3.42x, 1.84x, 1.37x, 1.81x, 1x, 1.71x, 1.03x, 11.86x... (2,165,859 games ago, 1y 6M 15d 7h 28m 14s ago)
    //Let's assume if we can handle 7500 games, we're safe
    //And let's simulate

    let totalGames = gamesToWaitForBot;
    let brInSatoshis = userInfo.balance;
    let nextBet = baseBetForBot;
    let broken = false;
    let bettedGames = 0;

    while (!broken) {
        brInSatoshis -= nextBet;
        totalGames++;
        bettedGames++;
        if (bettedGames == 1000) {
            nextBet *= 2;
        } else if (bettedGames > 1000 && bettedGames % 500 == 0) {
            nextBet *= 2;
        }
        if (nextBet > brInSatoshis) {
            biggestBet = nextBet;
            broken = true;
        }
    }
    return totalGames;
}