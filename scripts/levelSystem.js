// This is the function for calculating the new level and experience points for a pet.
// It takes in three parametes: the pet's current leve, the current experience points, and the number of gained experience points
// The idea is that this function can be used for gaining experience points in any form (i.e. games or items)
function calcNewLevelAndXP( currentLevel, currentXP, gainedXP) {
    let levelMaxXP;
    let totalXP = currentXP + gainedXP;
    let leftOverXP = totalXP;
    // initializing the result object
    // the initial values are set assuming that the pet did not gain enough XP to level up
    // so it stays at its current level and the newXP is just the sum of its current XP and gained XP
    let result = {
        newLevel: currentLevel,
        newXP: totalXP
    }

    // Need a while loop in case the amout of XP earned is enough to level up the pet several times
    // The level is currently capped at 100
    // If the leftOverXP is negative, then the pet does not have enough XP to level up, so no need to go through the loop
    while( leftOverXP > 0 && result.newLevel < 100) {
        // Determining the max XP for the pets current level
        // As the amout of XP needed to level up gets larger, we are decreasing the additional XP needed in the upper levels
        switch(currentLevel){
           case 1: 
            case 2: 
            case 3: 
            case 4:
            case 5: 
                levelMaxXP = 150 * currentLevel;
                break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
                levelMaxXP = 750 + (100 * (currentLevel - 5));
                break;
            case 16: 
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
                levelMaxXP = 1750 + (50 * (currentLevel - 15));
                break;
            default:
                levelMaxXP = 2200;
        }
        // Calculate the difference between the totalXP and the level's max XP
        leftOverXP = totalXP - levelMaxXP;
        // Set totalXP to the difference so it can be used in the next loop
        totalXP = leftOverXP;
        // IF difference is 0, then pet has earned enough to level up one level and the experience points return to 0
        if(leftOverXP === 0){
            result.newLevel++;
            result.newXP = 0;
        }
        // IF difference is positive, then pet has earned enought to level up one level 
        // and there is left over experience points to apply to the next level
        else if(leftOverXP > 0){
            result.newLevel++;
            result.newXP = leftOverXP;
        }
    }
    // If the new level is 100, then set the experience points to 0 because pet is at max level.
    if(result.newLevel === 100){
      result.newXP = 0;
    }
    return result;
}

module.exports = calcNewLevelAndXP;