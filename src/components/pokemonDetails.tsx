import { Box, Center, Divider, Flex, Heading, SimpleGrid, Text, VStack } from "@hope-ui/solid";
import { Pokemon, Type } from "pokenode-ts";
import { Component, For, Show, createEffect, createSignal } from "solid-js";

import { IMoveCard } from "../contracts/moveCard";
import { getWhatNotToBring, getWhatToBring } from "../helper/moveHelper";
import { capitalizeFirstLetter } from "../helper/stringHelper";
import { CustomImage } from "./common/image";
import { PokemonBestTypeSummary } from "./pokemonBestTypeSummary";
import { PokemonDetailMoveSummary } from "./pokemonDetailMoveSummary";
import { getTypeImg } from "../helper/externalImgHelper";

interface IProps {
    pokemon: Pokemon;
    selectedType?: Type;
    typeDetails: Array<Type>;
    showAllPokemon: boolean;
}

export const PokemonDetails: Component<IProps> = (props: IProps) => {
    const [attack, setAttack] = createSignal<Array<IMoveCard>>([]);
    const [defense, setDefense] = createSignal<Array<IMoveCard>>([]);

    createEffect(() => {
        const attack = getWhatToBring((props.selectedType != null) ? [props.selectedType] : props.typeDetails);
        const defense = getWhatNotToBring(props.typeDetails);

        setAttack(attack);
        setDefense(defense);
    });

    const imageOptions = [
        props.pokemon.sprites?.other?.['official-artwork']?.front_default,
        props.pokemon.sprites?.other?.dream_world?.front_default,
        props.pokemon.sprites?.other?.home?.front_default,
        props.pokemon.sprites.front_default,
        props.pokemon.sprites.front_shiny
    ];

    const statShortener = (statName: string) => {
        let localName = statName;
        if (statName == 'hp') localName = 'HP';
        if (statName == 'attack') localName = 'Atk';
        if (statName == 'defense') localName = 'Def';
        if (statName == 'special-attack') localName = 'Sp.Atk';
        if (statName == 'special-defense') localName = 'Sp.Def';
        if (statName == 'speed') localName = 'Spd';

        return localName;
    }

    return (
        <VStack>
            <Flex width="100%" ml="0.5em" mb="0.5em" gap="0.5em">
                <Box flex="2">
                    <Center class="poke-preview" flexDirection="column">
                        <CustomImage
                            src={imageOptions.filter(img => img != null)[0] ?? ''}
                            class="noselect"
                            maxHeight="200px"
                        />
                        <Heading size="2xl">{capitalizeFirstLetter(props.pokemon.name)}</Heading>
                        <Box m="0.25em"></Box>
                        <Center width="100%" gap="0.5em" mb="1em" class="types noselect">
                            <For each={props.pokemon.types}>
                                {pType => (
                                    <Box width="50%" class="type-container">
                                        <Center class={pType.type.name} p="0.5em" borderRadius="0.5em" borderWidth="2px">
                                            {capitalizeFirstLetter(pType.type.name)}
                                        </Center>
                                    </Box>
                                )}
                            </For>
                            <Show when={props.selectedType != null}>
                                <CustomImage
                                    src={getTypeImg(props.selectedType?.name ?? 'unknown')}
                                    height="2.5em"
                                    width="2.5em"
                                />
                            </Show>
                        </Center>
                        <SimpleGrid gap="0.5em" minChildWidth="100px" width="100%" class="base-stat">
                            <For each={props.pokemon.stats}>
                                {stat => (
                                    <Box >
                                        <Center p="0.5em" borderRadius="0.5em" borderWidth="2px" borderColor="grey" flexDirection="column">
                                            <Heading>{statShortener(stat.stat.name)}</Heading>
                                            <Text>{stat.base_stat}</Text>
                                        </Center>
                                    </Box>
                                )}
                            </For>
                        </SimpleGrid>
                    </Center>
                </Box>
                <PokemonDetailMoveSummary
                    pokemonName={capitalizeFirstLetter(props.pokemon.name)}
                    selectedType={props.selectedType}
                    attack={attack()}
                    defense={defense()}
                />
            </Flex>
            <Divider mt="1em" mb="3em" />
            <PokemonBestTypeSummary
                attack={attack()}
                defense={defense()}
                showAllPokemon={props.showAllPokemon}
            />
        </VStack>
    );
}