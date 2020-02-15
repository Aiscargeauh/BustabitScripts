var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
}

//Just a nyan chasing script
//Double the bet after the first 1000 games, then each 500 games

var baseBet = config.baseBet.value;
var isBetting = false;
var userProfit = 0;
var nyansChased = 0;
var looseStreak = 0;

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    engine.bet(config.baseBet.value, 1000); //NYAAAN
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (!gameInfos.cashedAt) {
        //Lost
        log('Lost...');
        if(looseStreak == 1000){
            baseBet *= 2;
        }else if(looseStreak > 1000 && looseStreak % 500 == 0){
            baseBet *= 2;
        }
        userProfit -= config.baseBet.value;
    } else {
        //Won
        log('Won!');
        userProfit += config.baseBet.value;
        looseStreak = 0;
        baseBet = config.baseBet.value;
        nyansChased++;
    }
    log('Current profit: ' + userProfit / 100 + ' bits. Got ' + nyansChased + ' nyans!');
    log('END GAME');
});