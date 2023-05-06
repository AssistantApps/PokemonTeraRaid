import { Type } from "pokenode-ts";
import { ITypesEffectiveness, typesEffectiveness } from "../constants/pokemonType";
import { IMoveCard } from "../contracts/moveCard";


export const getWhatToBring = (typeDetails: Array<Type>): Array<IMoveCard> => {
    const types: Array<ITypesEffectiveness> = [];
    for (const typeDetail of typeDetails) {
        const typeEffects = getWhatToBringForType(typeDetail);

        for (const typeEffect of typeEffects) {
            const existIndex = types.findIndex(t => t.name == typeEffect.name);
            if (existIndex >= 0) {
                types[existIndex].value *= typeEffect.value;
            } else {
                types.push(typeEffect);
            }
        }
    }

    const result: Array<IMoveCard> = [];
    for (const type of types) {
        const existingMoveCardIndex = result.findIndex(r => r.value == type.value);
        if (existingMoveCardIndex >= 0) {
            if (result[existingMoveCardIndex].types.includes(type.name)) continue;
            result[existingMoveCardIndex].types.push(type.name);
            continue;
        }

        result.push({
            value: type.value,
            types: [type.name],
        })
    }

    return result.sort((a, b) => b.value - a.value);
}

export const getWhatToBringForType = (typeDetail: Type): Array<ITypesEffectiveness> => {
    const result = typesEffectiveness();
    for (const typeDmg of typeDetail.damage_relations.double_damage_from) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 2;
    }
    for (const typeDmg of typeDetail.damage_relations.half_damage_from) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 0.5;
    }
    for (const typeDmg of typeDetail.damage_relations.no_damage_from) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 0;
    }

    return result;
}

export const getWhatNotToBring = (typeDetails: Array<Type>): Array<IMoveCard> => {
    const types: Array<ITypesEffectiveness> = [];
    for (const typeDetail of typeDetails) {
        const typeEffects = getWhatNotToBringForType(typeDetail);

        for (const typeEffect of typeEffects) {
            const existIndex = types.findIndex(t => t.name == typeEffect.name);
            if (existIndex >= 0) {
                types[existIndex].value *= typeEffect.value;
            } else {
                types.push(typeEffect);
            }
        }
    }

    const result: Array<IMoveCard> = [];
    for (const type of types) {
        const existingMoveCardIndex = result.findIndex(r => r.value == type.value);
        if (existingMoveCardIndex >= 0) {
            if (result[existingMoveCardIndex].types.includes(type.name)) continue;
            result[existingMoveCardIndex].types.push(type.name);
            continue;
        }

        result.push({
            value: type.value,
            types: [type.name],
        })
    }

    return result.sort((a, b) => a.value - b.value);
}

export const getWhatNotToBringForType = (typeDetail: Type): Array<ITypesEffectiveness> => {
    const result = typesEffectiveness();
    for (const typeDmg of typeDetail.damage_relations.double_damage_to) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 2;
    }
    for (const typeDmg of typeDetail.damage_relations.half_damage_to) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 0.5;
    }
    for (const typeDmg of typeDetail.damage_relations.no_damage_to) {
        const typeIndex = result.findIndex(t => t.name == typeDmg.name);
        result[typeIndex].value = 0;
    }

    return result;
}