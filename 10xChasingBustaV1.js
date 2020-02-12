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

var baseBet = 1;
var gamesToWait = 5;

var gamesWithout10 = 0;
var numberOf10xCashedOut = 0;
var userProfitInSatoshis = 0;
var isBettingNow = false;
var loosingStreak = 0;
var gamesToBeSafy = 130;
var biggestBet = 0;
var currentBetInSatoshis = baseBet;

var gamesTheBotCanHandle = CalculateBotSafeness(currentBetInSatoshis, gamesToWait);

console.log('FIRST LAUNCH | WELCOME!');
console.log('Bot safety check :');
console.log('-> You can manage to loose ' + gamesTheBotCanHandle + ' games without 10x before busting to zero');
console.log('-> With the maximum bet: ' + biggestBet + ' satoshis.');
console.log('-> We do assume 130 games is the maximum streak without 10x so...');
if(gamesTheBotCanHandle >= gamesToBeSafy){
	console.log('--> It looks safe with your parameters, let\'s go!');	
}else{
	console.log('--> Please stay around, it\'s not really safe with your parameters, chances to bust are quite high...');
}

engine.on('game_starting', function() {
	console.log('');
	console.log('NEW GAME');
	console.log('Games since no 10x: ' + gamesWithout10 + '. You can handle: ' + gamesTheBotCanHandle + ' games without 10x.');
	console.log('Actual profit using the script: ' + userProfitInSatoshis + ' sats. Got ' + numberOf10xCashedOut + ' times 10x.');
	if(gamesWithout10 > gamesToWait){
		//do place bet
		engine.placeBet(currentBetInSatoshis*100, 10*100);
		let wantedProfit = (currentBetInSatoshis * 9) + userProfitInSatoshis;
		console.log('Betting ' + currentBetInSatoshis + ' right now, looking for ' + wantedProfit + ' satoshis total profit.');
		isBettingNow = true;
	}else{
		isBettingNow = false;
		let calculatedGamesToWait = gamesToWait - gamesWithout10;
		if(calculatedGamesToWait == 0){
			console.log('Betting ' + baseBet + ' sats next game!');
		}else{
			console.log('Waiting for ' + calculatedGamesToWait + ' more games with no 10x');
		}
	}
})

engine.on('game_crash', function(data) {
	let gameInfos = data;
	if(isBettingNow){
		if(engine.lastGamePlay() == 'LOST'){
			userProfitInSatoshis -= currentBetInSatoshis;
			loosingStreak++;
			if(loosingStreak == 9){
				currentBetInSatoshis *= 2;
			}
			if(loosingStreak > 10 && loosingStreak % 5 == 0){
				currentBetInSatoshis *= 2;
			}
		}else if(engine.lastGamePlay() == 'WON'){
			numberOf10xCashedOut++;
			loosingStreak = 0;
			userProfitInSatoshis = userProfitInSatoshis + (currentBetInSatoshis * 9);
			currentBetInSatoshis = baseBet;
		}
	}
	if(gameInfos.game_crash > 10*100){
		gamesWithout10 = 0;
	}else{
		gamesWithout10++;
	}
	console.log('END GAME');
})

function CalculateBotSafeness(baseBetForBot, gamesToWaitForBot){
	//22:06 Cannonball: !streak < 10
	//22:06 Shiba: Seen 122 streak in games #1801655 - #1801776: 1.25x, 2.13x, 3.25x, 5.57x, 1.62x, 5.45x, 1.43x, 8.75x... (59,226 games ago, 15d 9h 10m 43s ago)
	//Let's assume if we can handle 130 games, we're safe
	//And let's simulate

	let gamesToBeSafe = 130;
	let totalGames = gamesToWaitForBot;
	let brInSatoshis = engine.getBalance()/100;
	let bettedGames = 0;
	let nextBet = baseBetForBot;
	let broken = false;
	let totalBet = 0;

	while(!broken){
		brInSatoshis -= nextBet;
		totalGames++;
		bettedGames++;
		totalBet += nextBet;
		if (bettedGames % 9 == 0 && bettedGames < 10) 
		{
			nextBet *= 2;
		}else if(bettedGames % 5 == 0 && bettedGames > 10){
			nextBet *= 2;
		}
		if(nextBet > brInSatoshis || totalBet > engine.getBalance()){
			biggestBet = nextBet;
			broken = true;
		}
	}
	return totalGames;
}