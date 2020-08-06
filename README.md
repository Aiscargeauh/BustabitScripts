# BustabitScripts

### DISCLAIMER
I (@Cannonball) am not responsible for any loss that could happen using one of the above scripts. Please use them with your own responsibility.

### Informations
This repository is opened to pull-requests. You can also report bugs in the scripts.
I'm also opened to new strategies / ideas, contact me on bustabit directly (@Cannonball) or via mail (aiscargeauh@protonmail.ch) if you want to get in touch.

I strongly advise you to test the scripts on https://mtihc.github.io/bustabit-script-simulator/ before using them. So you can understand the script and the risks before actually using it.
However, most of the scripts use "engine.history.toArray()" function which won't work on the simulator. If you want to try on the simulator, replace all "engine.history.toArray()" by 0. It will work the same.

## Strategies explanation

### Template
Well, it's a template, if you want to do scripts

### MultiStrats
Trying to make a mix in 10x and 2x, betting when you're "safe to bet".
This script doesn't bet a lot unless you have a bankroll big enough.
/!\Under development, not stable.

### 10x Chasing
In this script you can set the number of games that you want to wait before chasing the x10. Once this number of games is reached, it will bet the 'base bet' value that you sen when starting the script and double the bet when needed, to stay in profit.

I made a chart showing bet amount stages:  https://prnt.sc/r2urul.
And a typical bustabit chart: https://prnt.sc/r2us7p.

### 10x Chasing Busta v1
Same as 10x Chasing, but for the first version of bustabit.

### 2x Chasing
This script will chase the x2 multiplier.
It will begin to bet only after the number of red games that you input. After that, it will begin a martingale until there is a green game.

### 2x Timed Chasing
Little changes to the original 2x Chasing. Betting for X minutes or X games after a streak has been seen.
Please note it needs a green game to understand there has been such streak.

### Reverse Martingale
The idea of this script is to bet more after a won game, and return to base bet when you lost a game.
In order to make profit, you can set a limit of won games, to go back to the base bet after a won game. 
This script makes charts like https://prnt.sc/r1u8jo.

### Growing Payout
Here instead making the bet grow, we grow the payout.
There is a minimum and maximum payout to input. If it goes until the maximum, the script is reversing the process to lower the damage.

Bustabit chart: https://prnt.sc/r2ust3.

### OnTheMoon
That's a custom made script. Basically a martingale, but with a lot of parameters.
There is a nice interface for you to adjust your betting strategy.
You can use it to chase any multiplier.

### Bouncy3x
Custom script. Constantly chasing 3x, unless it is in cooldown, which you can set as parameter of the script.
Cooldown can be fixed or random between two values. For random cooldown, please input "min-max" with the dash "-" (for example 3-7 will give a number between 3 and 7) or it will crash the script.
It will bet two times using the base bet that you enter, then makes an addition with the two last bet that you did.
For example:
Game 1 bet 15 bits
Game 2 bet 15 bits
Game 3 bet 30 bits
Game 4 bet 45 bits
Game 5 bet 75 bits
Game 6 bet 120 bits
And so on, until 3x.