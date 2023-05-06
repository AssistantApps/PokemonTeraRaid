import { Box, Center, Heading, SimpleGrid } from "@hope-ui/solid";
import { Component, For, Show, createEffect, createSignal } from "solid-js";
import { NetworkState } from "../constants/enum/networkState";
import { IMoveCard } from "../contracts/moveCard";
import { capitalizeFirstLetter } from "../helper/stringHelper";
import { IPokemonByTypes, getPokemonByTypes } from "../services/api/pokeGraphQl";
import { Card } from "./common/card";
import { OpenInNewIcon } from "./common/icon/openInNewIcon";
import { CustomImage } from "./common/image";
import { LoadingSpinner } from "./core/loading";

interface IProps {
    attack: Array<IMoveCard>;
    defense: Array<IMoveCard>;
    showAllPokemon: boolean;
}

export const PokemonBestTypeSummary: Component<IProps> = (props: IProps) => {
    const [networkState, setNetworkState] = createSignal<NetworkState>(NetworkState.Loading);
    const [search, setSearch] = createSignal<Array<IPokemonByTypes>>([]);

    createEffect(() => {
        bestTypesForThisFight(props.attack, props.defense);
    });

    const bestTypesForThisFight = async (attackCards: Array<IMoveCard>, defenseCards: Array<IMoveCard>) => {
        if (attackCards?.length < 1 || defenseCards?.length < 1) {
            setNetworkState(NetworkState.Error);
            return;
        }

        setNetworkState(NetworkState.Loading);

        let excludeTypes: Array<string> = [];
        const defenseCardsOrdered: Array<IMoveCard> = defenseCards.sort((a, b) => b.value - a.value);
        for (const defense of defenseCardsOrdered) {
            if (excludeTypes.length > 0) continue;

            const types = defense.types;
            excludeTypes = [...excludeTypes, ...types];
        }
        if (excludeTypes.length < 1) {
            excludeTypes = defenseCards[defenseCards.length - 1].types;
        }

        let includeTypes: Array<string> = [];
        for (const attack of attackCards) {
            if (includeTypes.length > 1) continue;

            const types = attack.types;
            includeTypes = [...includeTypes, ...types];
        }

        // console.log('includeTypes', includeTypes);
        // console.log('excludeTypes', excludeTypes);

        try {
            const apiResp = await getPokemonByTypes(
                includeTypes,
                excludeTypes,
                props.showAllPokemon,
                200,
            );

            const apiRespMeta = apiResp.map(p => ({
                ...p,
                points: getPokemonByTypeRanking(apiResp, p, attackCards, defenseCards),
            }));

            const sorted = apiRespMeta.sort((a: any, b: any) => {
                return b.points - a.points;
            });

            setSearch(sorted.slice(0, 20));
            setNetworkState(NetworkState.Success);
        } catch (ex) {
            setSearch([]);
            setNetworkState(NetworkState.Error);
        }
    }

    const getPokemonByTypeRanking = (
        all: Array<IPokemonByTypes>,
        pkmbt: IPokemonByTypes,
        attackCards: Array<IMoveCard>,
        defenseCards: Array<IMoveCard>
    ): number => {
        let correctAttackPoints = 0;
        let weaknessPoints = 0;

        for (const attackCard of attackCards) {
            for (const pkmType of pkmbt.types) {
                if (attackCard.types.includes(pkmType)) {
                    correctAttackPoints += attackCard.value;
                }
            }
        }

        for (const defenseCard of defenseCards) {
            for (const pkmType of pkmbt.types) {
                if (defenseCard.types.includes(pkmType)) {
                    weaknessPoints += (defenseCard.value * 4);
                }
            }
        }

        let bonusPoints = 0;
        if (pkmbt.isLegendary) bonusPoints++;
        if (pkmbt.isMythical) bonusPoints++;
        if (pkmbt.evolvesFromSpecies) bonusPoints += getPokemonEvoPoints(all, pkmbt, 0);

        const points = (correctAttackPoints + bonusPoints) - weaknessPoints;
        // console.log(pkmbt.name, { correctAttackPoints, weaknessPoints, bonusPoints, total: points });
        return points;
    }

    const getPokemonEvoPoints = (
        all: Array<IPokemonByTypes>,
        pkmbt: IPokemonByTypes,
        currentDepth: number
    ): number => {
        if (pkmbt.evolvesFromSpecies == null) return currentDepth;
        const foundSpecies = all.find(a => a.id == pkmbt.evolvesFromSpecies);
        if (foundSpecies == null) return currentDepth + 1;

        return getPokemonEvoPoints(all, foundSpecies, currentDepth + 1);
    }

    return (
        <Box position="relative" width="100%">
            <Show when={networkState() == NetworkState.Error}>
                <Center>
                    <Heading m="1em" size="3xl" class="noselect">Something went wrong</Heading>
                </Center>
            </Show>
            <Show when={networkState() == NetworkState.Loading}>
                <Center position="absolute" top={0} left={0} right={0} height="100%" backgroundColor={search().length > 0 ? 'rgba(0,0,0,0.5)' : 'var(--hope-colors-background)'} borderRadius="$lg">
                    <LoadingSpinner />
                </Center>
            </Show>
            <Show
                when={search().length > 0}
                fallback={
                    <Center>
                        <Heading m="1em" size="3xl" class="noselect">No Pokemon found</Heading>
                    </Center>
                }
            >
                <Center>
                    <Heading size="2xl" mb="1em" class="noselect">Suggested Pokemon</Heading>
                </Center>
                <SimpleGrid gap="0.5em" columns={5} width="100%">
                    <For each={search()}>
                        {pokemon => (
                            <Card width="100%">
                                <Center flexDirection="column" position="relative">
                                    <CustomImage
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                        class="noselect"
                                        height="100px"
                                    />
                                    <Heading size="2xl">{capitalizeFirstLetter(pokemon.name)}</Heading>
                                    <Box m="0.25em" class="noselect"></Box>
                                    <Center width="100%" gap="0.5em" mb="1em" class="noselect">
                                        <For each={pokemon?.types ?? []}>
                                            {pType => (
                                                <Box width="50%">
                                                    <Center class={pType} p="0.5em" borderRadius="0.5em" borderWidth="2px">
                                                        {capitalizeFirstLetter(pType)}
                                                    </Center>
                                                </Box>
                                            )}
                                        </For>
                                    </Center>
                                    <Box position="absolute" top="0.125em" right="0.25em" class="noselect">
                                        <a href={`https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}`} title="Link to Bulbapedia" target="_blank" rel="noopener noreferrer">
                                            <OpenInNewIcon />
                                        </a>
                                    </Box>
                                </Center>
                            </Card>
                        )}
                    </For>
                </SimpleGrid>
            </Show>
        </Box>
    );
}