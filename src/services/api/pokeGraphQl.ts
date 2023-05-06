import { CacheKey } from "../../constants/cacheKey";
import { validPokemonNames } from "../../constants/pokemonScarletViolet";
import { hashQuery } from "../../helper/hashHelper";
import { getStorage } from "../internal/localStorageService";

export interface IPokemonByTypes {
    id: number;
    name: string;
    types: Array<string>;
    evolvesFromSpecies?: number;
    isLegendary: boolean;
    isMythical: boolean;
    generationId: string;
    points?: number;
}

export const getPokemonByTypes = async (
    includedTypes: Array<string>,
    excludedTypes: Array<string>,
    showAllPokemon: boolean,
    limit: number = 10,
    offset: number = 0,
): Promise<Array<IPokemonByTypes>> => {

    const inclStr = `"${includedTypes.join('","')}"`;
    const exclStr = `"${excludedTypes.join('","')}"`;

    const pokemonFilter = showAllPokemon
        ? '' : `name: {_in: ["${validPokemonNames.join('","')}"]}, `;

    const query = JSON.stringify({
        query: `
        {
            pokemon_v2_pokemon(where: {${pokemonFilter}pokemon_v2_pokemontypes: {pokemon_v2_type: {name: {_in: [${inclStr}], _nin: [${exclStr}]}}}}, limit: ${limit}, offset: ${offset}) {
                id
                name
                pokemon_v2_pokemontypes {
                    pokemon_v2_type {
                        name
                    }
                }
                pokemon_v2_pokemonspecy {
                    is_legendary
                    is_mythical
                    evolves_from_species_id
                    generation_id
                }
            }
        }`
    });

    const queryHash = `${CacheKey.getPokemonByTypes}-${hashQuery(query)}`;
    const cachedResponse = getStorage().get<Array<IPokemonByTypes>>(queryHash);
    if (cachedResponse != null) return cachedResponse;

    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: query,
    });
    const content = await response.json();

    const mapped: Array<IPokemonByTypes> = content.data.pokemon_v2_pokemon.map((p: any) => ({
        id: p.id,
        name: p.name,
        types: p.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name),
        isLegendary: p.pokemon_v2_pokemonspecy.is_legendary,
        isMythical: p.pokemon_v2_pokemonspecy.is_mythical,
        evolvesFromSpecies: p.pokemon_v2_pokemonspecy.evolves_from_species_id,
        generationId: p.pokemon_v2_pokemonspecy.generation_id,
    }));

    getStorage().set<Array<IPokemonByTypes>>(queryHash, mapped);

    return mapped;
}