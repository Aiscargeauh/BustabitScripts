var config = {
	baseBet: { value: 100, type: 'balance', label: 'Base Bet'},
}

let tenXCount = 0;
let twoXCount = 0;

engine.on('GAME_STARTING', function() {
    //Check which strategy to use
    ParseHistory();
    DetermineStrategy();
});

engine.on('GAME_ENDED', function() {

});

function ParseHistory(){
    let fullHistoryArray = engine.history.toArray();

    fullHistoryArray.forEach(game => {
        if(game.bust >= 10){
            tenXCount++;
        }
        if(game.bust >= 2){
            twoXCount++;
        }
    });
}

function DetermineStrategy(){
    if(GetGamesWithout2() > DetermineParametersTwoXChasing() //If we're safe to begin martingale 
        || twoXCount < (engine.history.toArray().length / 3) //If there is less than 1/3 that is green
        || GetMedian(engine.history.toArray().length) < 1.7){ //If the median on 50 games is below  1.7
        //We're safe to use 2x Chasing
        log("2x Chasing has been choosen");
    }else if(GetGamesWithout10() > DetermineParametersTenXChasing() //If we're safe to begin martingale
        ||  tenXCount < (engine.history.toArray().length / 13)){ //If there is less that 1/13 game that is 10x
        //We're safe to use 10x Chasing
        log("10x Chasing has been choosen");
    }else{
        log("No strategy choosen, sit back and relax");
    }
}

function GetMedian(numberOfGames){
    let fullHistoryArray = engine.history.toArray();
    let slicedHistoryArray = [];
    if(numberOfGames >= fullHistoryArray.length){
        slicedHistoryArray = engine.history.toArray();
    }else{
        slicedHistoryArray = fullHistoryArray.slice(0, numberOfGames);
    }
    let mid = Math.floor(numberOfGames / 2);
    slicedHistoryArray.sort((a, b) => a.bust - b.bust);
    let median = 0;
    if(numberOfGames % 2 !== 0){
        median = slicedHistoryArray[mid].bust;
    }else{
        median = (slicedHistoryArray[mid - 1].bust + slicedHistoryArray[mid].bust) / 2;
    }
    return median;
}

function DetermineParametersTenXChasing(){
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

	while(!broken){
		brInSatoshis -= nextBet;
		totalGames++;
		bettedGames++;
		if (bettedGames % 9 == 0 && bettedGames < 10) 
		{
			nextBet *= 2;
		}else if(bettedGames % 5 == 0 && bettedGames > 10){
			nextBet *= 2;
		}
		if(nextBet > brInSatoshis){
			broken = true;
		}
    }
    gamesToWait = gamesToBeSafe - totalGames;
	return gamesToWait;
}

function DetermineParametersTwoXChasing(){
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

function GetGamesWithout10(){
	let gamesArray = engine.history.toArray();
	let generatedGamesWithout10 = 0;

	for (var i = 0; i <= gamesArray.length; i++) {
		if(gamesArray[i].bust >= 10){
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