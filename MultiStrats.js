var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
}

//Add history generation https://gist.github.com/danielevns/adee44d3973865af9f22179564d22e7d
//Would be great

class GameObject{
    constructor(id, hash, bust, cashedAt, wager){
        this.id = id;
        this.hash = hash;
        this.bust = bust;
        this.cashedAt = cashedAt;
        this.wager = wager;
    }
}

//not working yet
// class TimedEvents{
//     startTime;
//     constructor(){
//         this.startTime = new Date();
//         log("Start time: " + this.startTime);
//         window.setInterval(this.TimeUpdate(this.startTime), 5 * 60000); //5 min
//     }
//     TimeUpdate(innerStartTime){
//         let preparedTime = ((Math.abs(new Date() - new Date(innerStartTime))) / 60000).toString().slice(0, currentMedian.toString().indexOf("."));
//         log("Script is running since " + preparedTime + " minutes now.");
//     }
// }

let tenXCount = 0;
let twoXCount = 0;
let userProfit = 0;
let loosingStreak = 0;
let twoXChasingCount = 0;
let tenXChasingCount = 0;
let currentBet = config.baseBet.value;
let currentStrategy = "";
let currentHistory = engine.history.toArray();
let historyArrayLength = currentHistory.length; //50 games but let's grow it
let currentMedian = GetMedian(historyArrayLength);
let gamesWithout2x = GetGamesWithout2();
let gamesNeededFor2x = DetermineParametersTwoXChasing();
let gamesWithout10x = GetGamesWithout10();
let gamesNeededFor10x = DetermineParametersTenXChasing();
//let timedEventsClass = new TimedEvents();


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
        log("No strategy choosen, sit back and relax.");
    }
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    let newestGame = new GameObject(gameInfos.id, gameInfos.hash, gameInfos.bust, gameInfos.cashedAt, gameInfos.wager);
    if (currentStrategy == "") {
        ParseHistory();
        DetermineStrategy();
    } else if (currentStrategy == "2xChasing") {
        if (!newestGame.cashedAt) {
            log("Lost... Continue x2 chasing");
            userProfit = userProfit - currentBet;
            currentBet *= 2;
            loosingStreak++;
        } else if (newestGame.cashedAt) {
            log("Won! Stopping x2 chasing");
            twoXChasingCount++;
            currentStrategy = "";
            loosingStreak = 0;
            userProfit = userProfit + currentBet;
            currentBet = config.baseBet.value;
        }
    } else if (currentStrategy == "10xChasing") {
        if (!newestGame.cashedAt) {
            log("Lost... Continue x10 chasing");
            loosingStreak++;
            userProfit = userProfit - currentBet;
            if (loosingStreak == 9) {
                currentBet *= 2;
            }
            if (loosingStreak > 10 && (loosingStreak + 1) % 5 == 0) {
                currentBet *= 2;
            }
        } else if (newestGame.cashedAt) {
            log("Won! Stopping x10 chasing");
            tenXChasingCount++;
            currentStrategy = "";
            loosingStreak = 0;
            userProfit = userProfit + (currentBet * 9);
            currentBet = config.baseBet.value;
        }
    }
    log('Current profit using the script: ' + userProfit / 100 + ' bits. Got ' + twoXChasingCount + ' times 2x and ' + tenXChasingCount + ' times 10x.');
    RefreshStats(newestGame);
    log('END GAME');
});

engine.on('MESSAGE', 'french', function () {
    log("received a message");
});

function RefreshStats(finishedGame) {
    currentHistory.push(finishedGame);
    historyArrayLength = currentHistory.length;
    if(historyArrayLength % 10 == 0){
        log("History length: " + historyArrayLength + ".");
    }
    gamesWithout10x = GetGamesWithout10();
    gamesNeededFor10x = DetermineParametersTenXChasing();
    gamesWithout2x = GetGamesWithout2();
    gamesNeededFor2x = DetermineParametersTwoXChasing();
}

//function placing bet
function TenXChasing() {
    log('Games since no 10x: ' + gamesWithout10x + '.');
    engine.bet(currentBet, 10);
}

//function placing bet
function TwoXChasing() {
    log('Games since no 2x: ' + gamesWithout2x + '.');
    engine.bet(currentBet, 2);
}

function DetermineStrategy() {
    if (currentStrategy == "") {
        ParseHistory();
        if (checkStat2x()) {
            //We're safe to use 2x Chasing
            currentStrategy = "2xChasing";
            log("2x Chasing starting next game!");
            log("It's been " + gamesWithout2x + " games without x2, we need " + gamesNeededFor2x + " games to be safe.");
            if (gamesWithout2x < gamesNeededFor2x) {
                log("Median is low enough to start 2x chasing");
            }
        } else if (checkStat10x()) {
            //We're safe to use 10x Chasing
            currentStrategy = "10xChasing";
            log("10x Chasing starting next game!");
            log("It's been " + gamesWithout10x + " games without x10, we need " + gamesNeededFor10x + " games to be safe.");
        }
    } else {
        currentStrategy = "";
    }
    log("Median on " + historyArrayLength + " games is: " + currentMedian.toString().slice(0, (currentMedian.toString().indexOf(".") + 3)) + ".");
}

function checkStat2x() {
    log("Games without 2x: " + gamesWithout2x + ". Betting when no 2x since: " + gamesNeededFor2x + " games.");
    if (gamesWithout2x > gamesNeededFor2x //If we're safe to begin martingale 
        //|| currentMedian < 1.6
        ) {
        return true;
    }
    return false;
}

function checkStat10x() {
    log("gamesWithout10x: " + gamesWithout10x + ". Betting when no 10x since: " + gamesNeededFor10x + " games.");
    if (gamesWithout10x > gamesNeededFor10x) //If there is less that 1/13 game that is 10x
    {
        return true;
    }
    return false;
}

function ParseHistory(xLatestGames = undefined) {
    tenXCount = 0;
    twoXCount = 0;

    if(xLatestGames != undefined){
        currentHistory.slice(0, limit).forEach(game => {
            if (game.bust >= 10) {
                tenXCount++;
            }
            if (game.bust >= 2) {
                twoXCount++;
            }
        });
    }else{
        currentHistory.forEach(game => {
            if (game.bust >= 10) {
                tenXCount++;
            }
            if (game.bust >= 2) {
                twoXCount++;
            }
        });
    }
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
    let gamesArray = currentHistory;
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
    let gamesArray = currentHistory;
    let generatedRedStreak = 0;

    for (var i = 0; i <= gamesArray.length; i++) {
        if (gamesArray[i].bust >= 2) {
            break;
        }
        generatedRedStreak++;
    }
    return generatedRedStreak;
}