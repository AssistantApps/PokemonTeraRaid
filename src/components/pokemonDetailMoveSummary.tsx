import { Box, Center, Flex, Heading, Text, VStack } from "@hope-ui/solid";
import { Component, For, Show } from "solid-js";
import { capitalizeFirstLetter } from "../helper/stringHelper";
import { IMoveCard } from "../contracts/moveCard";
import { Type } from "pokenode-ts";

interface IProps {
    pokemonName: string;
    selectedType?: Type;
    attack: Array<IMoveCard>;
    defense: Array<IMoveCard>;
}

export const PokemonDetailMoveSummary: Component<IProps> = (props: IProps) => {

    const renderCards = (cards: Array<IMoveCard>, title: string, valueFunc: (value: number) => string) => {
        return (
            <Show when={cards.length > 0}>
                <Box width="100%" px="1em" class="move-list noselect">
                    <Heading mb="0.5em" textAlign="center">{title}</Heading>
                    <For each={cards}>
                        {(moveCard, index) => (
                            <Box mb="1em" opacity={Math.max((1 - (index() * 0.2)), 0.2)}>
                                <Text>{valueFunc(moveCard.value)}</Text>
                                <Flex flexWrap="wrap" gap="0.5em">
                                    <For each={moveCard.types}>
                                        {pType => (
                                            <Box maxWidth="30%" width="calc(50% - 0.5em)" position="relative" class="move-type">
                                                <Show when={index() == 0}>
                                                    <Box class="sparkle type"></Box>
                                                </Show>
                                                <Center class={pType} p="0.5em" borderRadius="0.5em" borderWidth="2px">
                                                    {capitalizeFirstLetter(pType)}
                                                </Center>
                                            </Box>
                                        )}
                                    </For>
                                </Flex>
                            </Box>
                        )}
                    </For>
                </Box>
            </Show>
        );
    }

    const attackHeading = (pokemonName: string, selectedType?: Type) => {
        return selectedType != null
            ? `Attacking ${capitalizeFirstLetter(selectedType.name)} type`
            : `Attacking ${pokemonName}`;
    }

    return (
        <>
            <Box flex="3">
                <VStack gap="0.5em">
                    {renderCards(props.attack.sort((a, b) => b.value - a.value), attackHeading(props.pokemonName, props.selectedType), (value) => `Deal ${value}x damage with`)}
                </VStack>
            </Box>
            <Box flex="3">
                <VStack gap="0.5em">
                    {renderCards(props.defense.sort((a, b) => a.value - b.value), `Damage from ${props.pokemonName}`, (value) => `Receive ${value}x damage`)}
                </VStack>
            </Box>
        </>
    );
}