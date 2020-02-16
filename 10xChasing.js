var config = {
	baseBet: { value: 3200, type: 'balance', label: 'Base bet'},
	gamesToWait: { value: 25, type: 'text', label: 'Games to wait before making a bet'}
}

//10x chasing script by @Cannonball
//Feel free to tip, as is it a free script
//Also feel free to ping me if you got questions
//Will wait for the number of game you set before beginning the chase
//->Will bet 9 games at the base bet you set
//-->Will double the bet after 9 lost games
//--->Will double the bet after 6 lost games (15 total)
//---->Will double the bet every 5 games then (20, 25, 30...) until 10x
//Has a history feature, will check the current number of games since 10x at the beginning of script
//Has a simulation feature, will calculate how many games without 10x you can handle without busting your bankroll
//Has logging functionalities, press F12

var gamesWithout10 = GetGamesWithout10();
var numberOf10xCashedOut = 0;
var userProfitInSatoshis = 0;
var currentBetInSatoshis = config.baseBet.value;
var isBettingNow = false;
var loosingStreak = 0;
var gamesToBeSafy = 130;
var biggestBet = 0;

var gamesTheBotCanHandle = CalculateBotSafeness(config.baseBet.value, config.gamesToWait.value);
log('FIRST LAUNCH | WELCOME!');
log('Bot safety check :');
log('-> You can manage to loose ' + gamesTheBotCanHandle + ' games without 10x before busting to zero');
log('-> With the maximum bet: ' + biggestBet / 100 + 'bits.');
log('-> We do assume 130 games is the maximum streak without 10x so...');
if(gamesTheBotCanHandle >= gamesToBeSafy){
	log('--> It looks safe with your parameters, let\'s go!');	
}else{
	log('--> Please stay around, it\'s not really safe with your parameters, chances to bust are quite high...');
}

engine.on('GAME_STARTING', function() {
	log('');
	log('NEW GAME')
	log('Games since no 10x: ' + gamesWithout10 + '. You can handle: ' + gamesTheBotCanHandle + ' games without 10x.');
	log('Actual profit using the script: ' + userProfitInSatoshis /100 + ' bits. Got ' + numberOf10xCashedOut + ' times 10x.');
	if(gamesWithout10 > config.gamesToWait.value){
		//do place bet
		engine.bet(currentBetInSatoshis, 10);
		let currentBetInBits = currentBetInSatoshis / 100;
		let wantedProfit = (currentBetInBits * 9) + (userProfitInSatoshis / 100);
		log('Betting ' + currentBetInBits + ' right now, looking for ' + wantedProfit + ' bits total profit.')
		isBettingNow = true;
	}else{
		isBettingNow = false;
		let calculatedGamesToWait = config.gamesToWait.value - gamesWithout10;
		if(calculatedGamesToWait == 0){
			log('Betting ' + config.baseBet.value/100 + 'bit(s) next game!');
		}else{
			log('Waiting for ' + calculatedGamesToWait + ' more games with no 10x');
		}
	}
})

engine.on('GAME_ENDED', function() {
	let gameInfos = engine.history.first();
	if(isBettingNow){
		if(!gameInfos.cashedAt){
			userProfitInSatoshis -= currentBetInSatoshis;
			loosingStreak++;
			if(loosingStreak == 9){
				currentBetInSatoshis *= 2;
			}
			if(loosingStreak > 10 && (loosingStreak + 1) % 5 == 0){
				currentBetInSatoshis *= 2;
			}
		}else if(gameInfos.cashedAt){
			numberOf10xCashedOut++;
			loosingStreak = 0;
			userProfitInSatoshis = userProfitInSatoshis + (currentBetInSatoshis * 9);
			currentBetInSatoshis = config.baseBet.value;
		}
	}
	if(gameInfos.bust > 10){
		gamesWithout10 = 0;
	}else{
		gamesWithout10++;
	}
	log('END GAME');
})

function CalculateBotSafeness(baseBetForBot, gamesToWaitForBot){
	//22:06 Cannonball: !streak < 10
	//22:06 Shiba: Seen 122 streak in games #1801655 - #1801776: 1.25x, 2.13x, 3.25x, 5.57x, 1.62x, 5.45x, 1.43x, 8.75x... (59,226 games ago, 15d 9h 10m 43s ago)
	//Let's assume if we can handle 130 games, we're safe
	//And let's simulate

	let totalGames = gamesToWaitForBot;
	let brInSatoshis = userInfo.balance;
	let bettedGames = 0;
	let nextBet = baseBetForBot;
	let broken = false;

	while(!broken){
		brInSatoshis -= nextBet;
		totalGames++;
		bettedGames++;
		if (bettedGames % 9 == 0 && bettedGames < 10) 
		{
			nextBet *= 2;
		}else if((bettedGames + 1) % 5 == 0 && bettedGames > 10){
			nextBet *= 2;
		}
		if(nextBet > brInSatoshis){
			biggestBet = nextBet;
			broken = true;
		}
	}
	return totalGames;
}

function GetGamesWithout10(){
	let gamesArray = engine.history.toArray();
	let generatedGamesWithout10 = 0;

	for (var i = 0; i < gamesArray.length; i++) {
		if(gamesArray[i].bust >= 10){
			break;
		}
		generatedGamesWithout10++;
	}
	return generatedGamesWithout10;
}