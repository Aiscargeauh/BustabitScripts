//Only an idea for the moment
//Will implement soon

//Base turns would be:
//-->base bet @ x2
//-->if win, restart

//if base turn is lost, bet a turn to get back the lost bits and make a bit of profit:
//-->last bet * 6 @ x1.25

//if the previous turn is lost, go down the rabbit hole:
//-->last bet * 60.5% @ x3

//Continue turns until safety is reached (safety is an input from the user, it's how deep we go down in the rabbit hole)
//if safety is reached, go back to base turns



//Config
var config = {
    baseBet: { value: 100, type: 'balance', label: 'Base bet' },
    turnsInRabbitHole: { value: 4, type: 'text', label: 'Turns in the rabbit hole' }
}

//Variables
var currentTurn = "base"; //Can be "base", "secondBase", "rabbitHole"

log('FIRST LAUNCH | WELCOME!');

engine.on('GAME_STARTING', function () {
    log('');
    log('NEW GAME')

    switch (currentTurn) {
        case "base":
            log("Everything is fine, betting normally.");
            break;
        case "secondBase":
            log("Oh no, we lost last game! Trying to recover.");
            break;
        case "rabbitHole":
            log("Everything is on fire, going down the rabbit hole for " + config.turnsInRabbitHole.value + " turns.");
            break;
    }

});