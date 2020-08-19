var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
    chasingMultiplier: { value: 10, type: 'multiplier', label: 'Multiplier' },
    gamesToWait: { value: 25, type: 'text', label: 'Games to wait before making a bet' },
    multiplyOrAdd: {
        value: 'multiply', type: 'radio', label: 'Multiply or Add',
        options: {
            multiply: { value: 2, type: 'text', label: 'Multiply by' },
            add: { value: 100, type: 'balance', label: 'Add to bet' },
        }
    },
    maxBetOrMaxDeficit: {
        value: 'maxBet', type: 'radio', label: 'Max bet or max negative profit',
        options: {
            maxBet: { value: 100000, type: 'balance', label: 'Stop if bet is more than' },
            maxDeficit: { value: 100000, type: 'balance', label: 'Stop if deficit is more than' },
        }
    }
}

//Vars from config
var baseBet = config.baseBet.value;
var multiplier = config.chasingMultiplier.value;
var gamesToWait = config.gamesToWait.value;
var multiplyOrAdd = config.multiplyOrAdd.value;
if (multiplyOrAdd === "multiply") {
    var multiplyValue = config.multiplyOrAdd.options.multiply.value;
} else if (multiplyOrAdd === "add") {
    var addValue = config.multiplyOrAdd.options.add.value;
}
var maxBetOrMaxDeficit = config.maxBetOrMaxDeficit.value;
if (maxBetOrMaxDeficit === "maxBet") {
    var maxBet = config.maxBetOrMaxDeficit.options.maxBet.value;
} else if (maxBetOrMaxDeficit === "maxDeficit") {
    var maxDeficit = config.maxBetOrMaxDeficit.options.maxDeficit.value;
}

//Internal vars
var isBetting = false;
var userProfit = 0;
var gamesWithoutMultiplier = GetGamesWithoutX(multiplier);
var bettedGames = 0;
var numberOfCashout = 0;

//Display Stuff
log('FIRST LAUNCH | WELCOME!');
console.log('It has been ' + gamesWithoutMultiplier + ' games without ' + multiplier + "x.")

//Game events
engine.on('GAME_STARTING', function () {
    //Do some pretty logs
    log('');
    log('NEW GAME')
    log('Games without ' + multiplier + 'x: ' + gamesWithoutMultiplier + '.');
    log('Actual profit using the script: ' + userProfit / 100 + ' bits. Got ' + numberOfCashout + ' times ' + multiplier + 'x.');

    if (gamesWithoutMultiplier >= gamesToWait) {
        //Do place the bet
        let tempBaseBet = ((baseBet / 100).toFixed()) * 100;
        engine.bet(tempBaseBet, multiplier);
        isBetting = true;
        let currentBetInBits = tempBaseBet / 100;
        let wantedProfit = (currentBetInBits * (multiplier - 1)) + (userProfit / 100);
        log('Betting ' + currentBetInBits + ' right now, looking for ' + wantedProfit + ' bits total profit.')
    } else {
        //Not betting yet, inform user
        isBetting = false;
        let calculatedGamesToWait = gamesToWait - gamesWithoutMultiplier;
        if (calculatedGamesToWait == 1) {
            log('Betting ' + ((baseBet / 100).toFixed()) + 'bit(s) next game!');
        } else {
            log('Waiting for ' + calculatedGamesToWait + ' more games with no ' + multiplier + 'x');
        }
    }

});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (isBetting) {
        if (!gameInfos.cashedAt) {
            log('Lost...');

            //Update variables
            userProfit -= ((baseBet / 100).toFixed() * 100);
            bettedGames++;

            //If it's time to change baseBet
            if (bettedGames == multiplier - 1 || (bettedGames > multiplier && (bettedGames % multiplier == 0 || bettedGames % multiplier == multiplier / 2))) {
                //Add or multiply value (both at the same time possible)
                if (multiplyValue != undefined) {
                    baseBet *= multiplyValue;
                }
                if (addValue != undefined) {
                    baseBet += addValue;
                }
            }

            //Checks about max bet and max deficit
            if (maxBet != undefined && baseBet > maxBet) {
                stop("Script stopped. Max bet reached: " + maxBet / 100 + ". Profit is: " + userProfit / 100 + ".");
            } else if (maxDeficit != undefined && userProfit > maxDeficit) {
                stop("Script stopped. Max deficit reached: " + userProfit / 100 + ". Next bet would have been: " + baseBet / 100);
            }
        } else {
            //Won
            log('Won! Returning to base bet');
            //Reset variables, add this cashout to profit
            userProfit += (((baseBet / 100).toFixed() * 100) * multiplier) - ((baseBet / 100).toFixed() * 100);
            baseBet = config.baseBet.value;
            bettedGames = 0;
            numberOfCashout++;
        }
    }
    if (gameInfos.bust >= multiplier) {
        gamesWithoutMultiplier = 0;
    } else {
        gamesWithoutMultiplier++;
    }
    log('Current profit: ' + userProfit / 100 + ' bits.');
    log('END GAME');
});

//Helping functions
function GetGamesWithoutX(theX) {
    let gamesArray = engine.history.toArray(); //Only 50 games, if not found, return 50
    let generatedGamesWithoutX = 0;

    for (var i = 0; i < gamesArray.length; i++) {
        if (gamesArray[i].bust >= theX) {
            break;
        }
        generatedGamesWithoutX++;
    }
    return generatedGamesWithoutX;
}