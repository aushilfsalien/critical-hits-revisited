if (args[0].macroPass == 'postActiveEffects' && !workflow.isCritical && !workflow.isFumble && workflow.fumbleSaves.size > 0) {
    game.critsRevisited.rollForFumbledSaves(workflow);
}