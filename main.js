// Description: This script contains the main functions for the module.
console.log("Critical Hits Revisited is starting to load!");

import {utils} from './lib/utils/utils.js';
import {effectMacros} from "./lib/effectmacros/effectMacros.js";
import {effectTables} from "./lib/data/effectTables.js";
import {effectData} from "./lib/data/effecData.js";

export const critsRevisited = {
    // damageTypes that have no critical hits or fumbles and will end the function early
    undesiredTypes: ["none", "no type", "no damage", "temphp", ""],
    // damageTypes that are not preferred for critical hits amd will be used as a last resort
    nonPreferredTypes: ['bludgeoning', 'slashing', 'piercing'],

    // Called from the itemMacro, when a critical hit is rolled. In the call, the workflowObject and the critState
    // string have to be passed.
    rollForCriticalEvents: async function (workflowObject, critState) {
        let attackDamageType = "Critical Fumbles";
        if (critState !== "isFumble") {
            attackDamageType = await this.getAttackDamageType(workflowObject.damageDetail, workflowObject.damageItem)
        } else if (!attackDamageType || this.undesiredTypes.includes(attackDamageType)) {
            return;
        }
        const critEventHandler = {
            isCritical: async () => this.handleCritEvents(workflowObject.damageList, attackDamageType),
            isFumble: async () => this.rollOnTable(workflowObject.actor.uuid, attackDamageType),
            isFumbledSave: async () => this.handleCritEvents(workflowObject.fumbleSaves, attackDamageType)
        };
        await critEventHandler[critState]();
        console.log("Critical Hits Revisited: Critical Event rolled!");
        return true;
    },
    handleCritEvents: async function (targets, attackDamageType) {
        for (const token of targets) {
            const uuid = token.actorUuid ?? token.document?.actor.uuid;
            if (uuid) {
                await this.rollOnTable(uuid, attackDamageType);
            }
        }
    },
    rollOnTable: async function (targetUuid, attackDamageType) {
        let tableName = utils.capitalizeFirstLetter(attackDamageType);
        let rollResult = await game.tables.getName(tableName).draw({displayChat: true, rollMode: "publicroll"});
        for (let result of rollResult.results) {
            let rollRange = result.range.toString();
            // clean the tableName from whitespaces
            tableName = result.parent.name.replace(/\s+/g, '');
            // get the linked effects
            let effects = effectTables[tableName][rollRange];
            if (effects) {
                await utils.applyEffects(effects, targetUuid, tableName);
            }
        }
    },
    getAttackDamageType: async function (damageDetail, damageItem) {
        if (damageDetail.length === 0) return;
        let attackDamageType;
        if (damageDetail.length > 0) {
            let targetUuid = damageItem.actorUuid;
            let filteredDetails = await Promise.all(damageDetail.map(async detail => {
                const isImmune = await utils.checkImmunity(detail.type, targetUuid, detail.type);
                if (!isImmune) {
                    return [detail.type, detail.damage];
                }
            }));
            filteredDetails = filteredDetails.filter(detail => detail !== undefined);
            if(filteredDetails.length === 0) return null;
            let maxDamageValue = Math.max(...filteredDetails.map(([_, damage]) => damage));
            let maxDamageTypes = filteredDetails.filter(([_, damage]) => damage === maxDamageValue);
            if (maxDamageTypes.length > 1) {
                let preferredType = maxDamageTypes.find(([type]) => !this.nonPreferredTypes.includes(type));
                attackDamageType = preferredType ? preferredType[0] : maxDamageTypes[0][0];
            } else {
                attackDamageType = maxDamageTypes[0][0];
            }
        } else {
            attackDamageType = damageDetail[0]?.type || null;
        }
        return attackDamageType;
    }
}

// Add the helperFunctions and itemMacros to critsRevisited
critsRevisited.utils = utils;
critsRevisited.effectMacros = effectMacros;
critsRevisited.effectData = effectData;

// Attach critsRevisited to the game object once Foundry is fully loaded
Hooks.once('ready', () => {
    game.critsRevisited = critsRevisited;
});

console.log("Critical Hits Revisited has finished loading!");