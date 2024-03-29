## Sorry to say I have no time to work on this project anymore, so I am archiving it. You can still fork and use the scripts but I will not do any change now.

# BustabitScripts

### DISCLAIMER
I (@Cannonball) am not responsible for any loss that could happen using one of the above scripts. Please use them with your own responsibility.

### Informations
~~Feel free to open an issue (https://github.com/Ncw007/BustabitScripts/issues) to ask for new scripts or report bugs.
You can also fork this repository, add your script then create a pull-request to add your script to the list.~~

I strongly advise you to test the scripts on https://mtihc.github.io/bustabit-script-simulator/ before using them. So you can understand the script and the risks before actually using it.
However, most of the scripts use "engine.history.toArray()" function which won't work on the simulator. If you want to try on the simulator, replace all "engine.history.toArray()" by 0. It will work the same.

## Strategies explanation

### Template
Well, it's a template, if you want to do scripts

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

### Bouncy3xEnhanced
Custom script, modification of the Bouncy3x.
Instead of red streak, it is < 3 streak. It also stops when a 3x is taken and will restart the betting scheme to not go over the new "max bet" parameter.

### KultorKnight
Custom script (@Kultor). Modification of the OnTheMoon script, with the automatic bet adjustment of the 10xChasing script. You can still choose to multiply or add to the base bet, but it will be applied first when the number of games is equal to the chased multiplier, then every multiplier/2 games.
