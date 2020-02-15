var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
}

//Limit variable: Being able to set a maximum payout.
//If reached, go back in reverse to minimize damage.

var baseBet = config.baseBet.value;
var isBetting = false;
var userProfit = 0;

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    engine.bet(config.baseBet.value, PAYOUT);
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if (!gameInfos.cashedAt) {
        //Lost
        log('Lost...');
        userProfit -= config.baseBet.value;
    } else {
        //Won
        log('Won!');
        userProfit += config.baseBet.value;
    }
    log('Current profit: ' + userProfit / 100 + ' bits.');
    log('END GAME');
});