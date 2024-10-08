import {mainScriptUtils} from "../../../../utils/mainScriptUtils.js";
import {animationUtils} from "../../../../utils/animationUtils.js";

/**
 * Acid Bath checks if the actor has armor equipped and if so, it reduces the armor class to 0/deletes the armor.
 * @param effect {effect} The effect object, passed by the effect macro
 * @param token {token} The token object, passed by the effect macro
 * @param actor {actor} The actor object, passed by the effect macro
 * @returns {Promise<void>}
 */

export async function acidBath(effect, token, actor) {
    mainScriptUtils.debug("acidbath - actor", actor);
    mainScriptUtils.debug("acidbath - effect", effect);
    const equippedArmor = actor.system.attributes.ac.equippedArmor;
    if (!equippedArmor) {
        mainScriptUtils.debug("acidbath - Debug Actor uuid:", actor.uuid);
        await mainScriptUtils.createMessage(actor.uuid, '<div class="result-text"><b>Acid Bath</b> - ' + actor.name + ' has no armor equipped and therefore is disfigured by the acid!' + '</div>');
        await mainScriptUtils.applyEffects('Disfigured', actor.uuid, 'Acid');
        effect.delete();
        return;
    }
    animationUtils.playAnimation('acidbath', token);
    mainScriptUtils.debug("acidbath - Debug Token:", token);
    const isMagical = equippedArmor.labels.properties.some(entry => entry.label === "Magical");
    if (isMagical) {
        await actor.system.attributes.ac.equippedArmor.system.updateSource({'armor.value': 10});
        await actor.system.attributes.ac.equippedArmor.system.updateSource({'armor.magicalBonus': 0});
        await mainScriptUtils.createMessage(actor.uuid, '<div class="result-text"><b>Acid Bath</b> - The acid of the last attack has rendered ' + actor.name + 's armor useless! It has magical properties so it can be repaired.' + '</div>');
    } else {
        equippedArmor.delete();
        await mainScriptUtils.createMessage(actor.uuid, '<div class="result-text"><b>Acid Bath</b> - The acid of the last attack has destroyed ' + actor.name + 's armor because it had no magical properties!' + '</div>');
    }
    effect.delete();
}