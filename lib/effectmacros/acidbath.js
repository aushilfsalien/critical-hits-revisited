import { helperFunctions } from '../helperFunctions.js';

export async function acidBath(target) {
    const equippedArmor = target.system.attributes.ac.equippedArmor;
    if (!equippedArmor) {
        await helperFunctions.createChatMessage(target, '<div class="result-text"><b>Acid Bath</b> - ' + target.name + ' has no armor equipped!' + '</div>');
        return;
    }
    const isMagical = equippedArmor.labels.properties.some(entry => entry.label === "Magical");
    if (isMagical) {
        target.system.attributes.ac.equippedArmor.system.updateSource({'armor.value': 10});
        target.system.attributes.ac.equippedArmor.system.updateSource({'armor.magicalBonus': 0});
        await helperFunctions.createChatMessage(target, '<div class="result-text"><b>Acid Bath</b> - The acid of the last attack has rendered ' + target.name + 's armor useless! It has magical properties so it can be repaired.' + '</div>');
    } else {
        equippedArmor.delete();
        await helperFunctions.createChatMessage(target, '<div class="result-text"><b>Acid Bath</b> - The acid of the last attack has destroyed ' + target.name + 's armor because it had no magical properties!' + '</div>');
    }
}