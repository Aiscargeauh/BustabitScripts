var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base Bet' },
    minimumPayout: { value: 2, type: 'multiplier', label: 'Minimum Payout' },
    maximumPayout: { value: 100, type: 'multiplier', label: 'Maximum Payout' }
}

//Limit variable: Being able to set a maximum payout.
//If reached, go back in reverse to minimize damage.

var currentPayout = config.minimumPayout.value;
var isBetting = false;
var userProfit = 0;
var isGoingUp = true;

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')
    log('Chasing payout: x' + currentPayout + '.');
    engine.bet(config.baseBet.value, currentPayout);
    isBetting = true;
});

engine.on('GAME_ENDED', function () {
    let gameInfos = engine.history.first();
    if(isBetting){
        if (!gameInfos.cashedAt) {
            //Lost
            if(isGoingUp){
                currentPayout += 1;
                if(currentPayout >= config.maximumPayout.value && isGoingUp){
                    isGoingUp = false;
                    log("Now going down.");
                }
            }else{
                currentPayout -= 1;
                if(currentPayout <= config.minimumPayout.value && !isGoingUp){
                    log("Now going up.");
                    isGoingUp = true;
                    currentPayout = config.minimumPayout.value;
                }
            }
            userProfit -= config.baseBet.value;
            log('Lost...');
        }else{
            //Won
            userProfit += config.baseBet.value;
            currentPayout = config.minimumPayout.value;
            log('Won! Returning to minimum payout.');
        }
        log('Current profit: ' + userProfit/100 + ' bits.');
    }
    log('END GAME');
});