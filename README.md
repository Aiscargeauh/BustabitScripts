# BustabitScripts

### DISCLAIMER
I (@Cannonball) am not responsible for any loss that could happen using one of the above scripts.

### Informations
This repository is opened to pull-requests. You can also report bugs in the scripts.
I'm also opened to new strategies / ideas, contact me on bustabit directly (@Cannonball) or via mail (aiscargeauh@protonmail.ch) if you want to get in touch.

I strongly advise you to test the scripts on https://mtihc.github.io/bustabit-script-simulator/ before using them. So you can understand the script and the risks before actually using it.

## Strategies explanation

### Template
Well, it's a template, if you want to do scripts

### MultiStrats
Trying to make a mix in 10x and 2x, betting when you're "safe to bet".
This script doesn't bet a lot unless you have a bankroll big enough.

### 10x Chasing
In this script you can set the number of games that you want to wait before chasing the x10. Once this number of games is reached, it will bet the 'base bet' value that you sen when starting the script and double the bet when needed, to stay in profit.

I made a chart showing bet amount stages:  https://prnt.sc/r2urul.
And a typical bustabit chart: https://prnt.sc/r2us7p.

### 10x Chasing Busta v1
Same as 10x Chasing, but for the first version of bustabit.

### 2x Chasing
This script will chase the x2 multiplier.
It will begin to bet only after the number of red games that you input. After that, it will begin a martingale until there is a green game.

### Reverse Martingale
The idea of this script is to bet more after a won game, and return to base bet when you lost a game.
In order to make profit, you can set a limit of won games, to go back to the base bet after a won game. 
This script makes charts like https://prnt.sc/r1u8jo.

### Growing Payout
Here instead making the bet grow, we grow the payout.
There is a minimum and maximum payout to input. If it goes until the maximum, the script is reversing the process to lower the damage.

Bustabit chart: https://prnt.sc/r2ust3.