var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
}

let tenXCount = 0;
let twoXCount = 0;
let userProfit = 0;
let loosingStreak = 0;
let twoXChasingCount = 0;
let tenXChasingCount = 0;
let currentStrategy = "";
let historyArrayLength = engine.history.toArray().length; //Should be 100, but is 50, dont know why
let currentBet = config.baseBet.value;

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    if (currentStrategy == "2xChasing") {
        log("2x Chasing starting!");
        TwoXChasing();
    } else if (currentStrategy == "10xChasing") {
        log("10x Chasing starting!");
        TenXChasing();
    } else {
        log("No strategy choosen, sit back and relax");
    }
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (currentStrategy == "") {
        ParseHistory();
        DetermineStrategy();
    } else if (currentStrategy == "2xChasing") {
        if (!gameInfos.cashedAt) {
            log("Lost... Continue x2 chasing");
            userProfit = userProfit - currentBet;
            currentBet *= 2;
            loosingStreak++;
        } else if (gameInfos.cashedAt) {
            log("Won! Stopping x2 chasing");
            twoXChasingCount++;
            currentStrategy = "";
            loosingStreak = 0;
            userProfit = userProfit + currentBet;
            currentBet = config.baseBet.value;
        }
    } else if (currentStrategy == "10xChasing") {
        if (!gameInfos.cashedAt) {
            log("Lost... Continue x10 chasing");
            loosingStreak++;
            userProfit = userProfit - currentBet;
            if(loosingStreak == 9){
				currentBet *= 2;
			}
			if(loosingStreak > 10 && (loosingStreak + 1) % 5 == 0){
				currentBet *= 2;
			}
        } else if (gameInfos.cashedAt) {
            log("Won! Stopping x10 chasing");
            tenXChasingCount++;
            currentStrategy = "";
            loosingStreak = 0;
            userProfit = userProfit + (currentBet * 9);
            currentBet = config.baseBet.value;
        }
    }
    log('Current profit using the script: ' + userProfit / 100 + ' bits. Got ' + twoXChasingCount + ' times 2x and ' + tenXChasingCount + ' times 10x.');
    log('END GAME');
});

chat.on('message', function () {
    log("received a message");
});

function TenXChasing() {
    log('Games since no 10x: ' + GetGamesWithout10() + '.');
    engine.bet(currentBet, 10);
}

function TwoXChasing() {
    log('Games since no 2x: ' + GetGamesWithout2() + '.');
    engine.bet(currentBet, 2);
}

function DetermineStrategy() {
    if (currentStrategy == "") {
        ParseHistory();
        let gamesWithout2x = GetGamesWithout2();
        let gamesNeededFor2x = DetermineParametersTwoXChasing();
        let gamesWithout10x = GetGamesWithout10();
        let gamesNeededFor10x = DetermineParametersTenXChasing();
        let currentMedian = GetMedian(historyArrayLength);

        if (gamesWithout2x > gamesNeededFor2x //If we're safe to begin martingale 
            || twoXCount < (historyArrayLength / 3) //If there is less than 1/3 that is green
            || currentMedian < 1.6) { //If the median on 50 games is below  1.6

            //We're safe to use 2x Chasing
            currentStrategy = "2xChasing";
            log("2x Chasing starting next game!");
            log("It's been " + gamesWithout2x + " games without x2, we need " + gamesNeededFor2x + " games to be safe.");
            if (gamesWithout2x < gamesNeededFor2x) {
                log("Median is low enough to start 2x chasing");
            }
        } else if (gamesWithout10x > gamesNeededFor10x //If we're safe to begin martingale
            || tenXCount < (historyArrayLength / 13)) { //If there is less that 1/13 game that is 10x
                if(gamesWithout10x < gamesNeededFor10x){
                    log("10x is rare enough to start 10x chasing");
                }
            //We're safe to use 10x Chasing
            currentStrategy = "10xChasing";
            log("10x Chasing starting next game!");
            log("It's been " + gamesWithout10x + " games without x10, we need " + gamesNeededFor10x + " games to be safe.");
        } else {
            currentStrategy = "";
        }
        log("Median on " + historyArrayLength + " games is: " + currentMedian.toString().slice(0, (currentMedian.toString().indexOf(".") + 3)));
    }
}

function ParseHistory() {
    let fullHistoryArray = engine.history.toArray();

    fullHistoryArray.forEach(game => {
        if (game.bust >= 10) {
            tenXCount++;
        }
        if (game.bust >= 2) {
            twoXCount++;
        }
    });
}

function GetMedian(numberOfGames) {
    let fullHistoryArray = engine.history.toArray();
    let slicedHistoryArray = [];
    if (numberOfGames >= fullHistoryArray.length) {
        slicedHistoryArray = fullHistoryArray;
    } else {
        slicedHistoryArray = fullHistoryArray.slice(0, numberOfGames);
    }
    let mid = Math.floor(numberOfGames / 2);
    slicedHistoryArray.sort((a, b) => a.bust - b.bust);
    let median = 0;
    if (numberOfGames % 2 !== 0) {
        median = slicedHistoryArray[mid].bust;
    } else {
        median = (slicedHistoryArray[mid - 1].bust + slicedHistoryArray[mid].bust) / 2;
    }
    return median;
}

function DetermineParametersTenXChasing() {
    //22:06 Cannonball: !streak < 10
    //22:06 Shiba: Seen 122 streak in games #1801655 - #1801776: 1.25x, 2.13x, 3.25x, 5.57x, 1.62x, 5.45x, 1.43x, 8.75x... (59,226 games ago, 15d 9h 10m 43s ago)
    //Let's assume if we can handle 130 games, we're safe
    //And let's simulate

    let brInSatoshis = userInfo.balance;
    let nextBet = config.baseBet.value;
    let gamesToBeSafe = 130;
    let totalGames = 0;
    let bettedGames = 0;
    let gamesToWait = 0;
    let broken = false;

    while (!broken) {
        brInSatoshis -= nextBet;
        totalGames++;
        bettedGames++;
        if (bettedGames % 9 == 0 && bettedGames < 10) {
            nextBet *= 2;
        } else if (bettedGames % 5 == 0 && bettedGames > 10) {
            nextBet *= 2;
        }
        if (nextBet > brInSatoshis) {
            broken = true;
        }
    }
    gamesToWait = gamesToBeSafe - totalGames;
    return gamesToWait;
}

function DetermineParametersTwoXChasing() {
    //15:41 Cannonball: !streak < 2
    //15:41  Shiba: Seen 20 streak in games #2684941 - #2684960: 1.07x, 1.31x, 1.64x, 1.27x, 1x, 1.14x, 1.81x, 1.52x... (178,392 games ago, 1M 15d 11h 48m 19s ago)
    //Let's assume if we can handle 25 games, we're safe
    //And let's simulate

    let brInSatoshis = userInfo.balance;
    let nextBet = config.baseBet.value;
    let gamesToBeSafe = 25;
    let totalGames = 0;
    let gamesToWait = 0;
    let broken = false;

    while (!broken) {
        brInSatoshis -= nextBet;
        totalGames++;
        nextBet *= 2;
        if (nextBet > brInSatoshis) {
            broken = true;
        }
    }
    gamesToWait = gamesToBeSafe - totalGames;
    return gamesToWait;
}

function GetGamesWithout10() {
    let gamesArray = engine.history.toArray();
    let generatedGamesWithout10 = 0;

    for (var i = 0; i <= gamesArray.length; i++) {
        if (gamesArray[i].bust >= 10) {
            break;
        }
        generatedGamesWithout10++;
    }
    return generatedGamesWithout10;
}

function GetGamesWithout2() {
    let gamesArray = engine.history.toArray();
    let generatedRedStreak = 0;

    for (var i = 0; i <= gamesArray.length; i++) {
        if (gamesArray[i].bust >= 2) {
            break;
        }
        generatedRedStreak++;
    }
    return generatedRedStreak;
}