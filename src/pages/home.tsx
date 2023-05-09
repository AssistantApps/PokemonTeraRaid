import { Box, Center, Container, Flex, Heading, Spacer, Switch, Text, VStack } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Pokemon, PokemonClient, Type } from 'pokenode-ts';
import { Component, Show, createSignal, onMount } from 'solid-js';

import { Autocomplete } from '../components/common/autocomplete';
import { PokemonAutocompleteTile } from '../components/common/autocompleteTile/pokemonTile';
import { Card } from '../components/common/card';
import { Dropdown, IDropdownOption } from '../components/common/dropdown';
import { PageHeader } from '../components/common/pageHeader';
import { CenterLoading, LoadingSpinner, SmolLoadingSpinner } from '../components/core/loading';
import { PokemonDetails } from '../components/pokemonDetails';
import { NetworkState } from '../constants/enum/networkState';
import { routes } from '../constants/route';
import { getSelectedPokemon, getSelectedTeraType } from '../services/store/sections/teraRaidState';
import { getStateService } from '../services/store/stateService';
import { capitalizeFirstLetter } from '../helper/stringHelper';

export const HomePage: Component = () => {
    const stateRef = getStateService();
    const [selectedPkmnName, setSelectedPkmnName] = getSelectedPokemon(stateRef);
    const [selectedTeraType, setSelectedTeraType] = getSelectedTeraType(stateRef);

    const [networkState, setNetworkState] = createSignal<NetworkState>(NetworkState.Loading);
    const [typesNetworkState, setTypesNetworkState] = createSignal<NetworkState>(NetworkState.Loading);
    const [types, setTypes] = createSignal<Array<IDropdownOption>>([]);
    const [pokemonNamesNetworkState, setPokemonNamesNetworkState] = createSignal<NetworkState>(NetworkState.Loading);
    const [pokemonOptions, setPokemonOptions] = createSignal<Array<IDropdownOption>>([]);
    const [pokemonOptionsToDisplay, setPokemonOptionsToDisplay] = createSignal<Array<IDropdownOption>>([]);
    const [selectedPokemon, setSelectedPokemon] = createSignal<Pokemon>();
    const [selectedPokemonNetworkState, setSelectedPokemonNetworkState] = createSignal<NetworkState>(NetworkState.Success);
    const [typeDetails, setTypeDetails] = createSignal<Array<Type>>([]);
    const [showAllPokemon, setShowAllPokemon] = createSignal<boolean>(false);
    const [selectedType, setSelectedType] = createSignal<Type>();

    const api = new PokemonClient();

    onMount(() => {
        getTypes();
        getPokemon();

        setTimeout(() => {
            const promiseArr: Array<Promise<any>> = [];
            if (selectedPkmnName() != null) {
                promiseArr.push(
                    getPokemonDetails(selectedPkmnName())
                );
            }
            if (selectedTeraType() != null) {
                promiseArr.push(
                    selectType(selectedTeraType())
                );
            }

            Promise.all(promiseArr).then(() => setNetworkState(NetworkState.Success));
        }, 100);
    })

    const getPokemon = async () => {
        setPokemonNamesNetworkState(NetworkState.Loading);

        const jsonFile = showAllPokemon() ? 'pokemon' : 'serebii';
        const pokemonOptionsResult = await fetch(`/assets/json/${jsonFile}.json`);
        const pokemonOptions = await pokemonOptionsResult.json();

        setPokemonOptions(pokemonOptions);
        setPokemonOptionsToDisplay(pokemonOptions);
        setPokemonNamesNetworkState(NetworkState.Success);
    }

    const getTypes = async () => {
        const typeOptionsResult = await fetch('/assets/json/type.json');
        const typeOptions: Array<IDropdownOption> = await typeOptionsResult.json();

        typeOptions.unshift({
            title: 'None',
            value: undefined,
        } as any)

        setTypes(typeOptions);
        setTypesNetworkState(NetworkState.Success);
    }

    const getPokemonDetails = async (pokemonName?: string) => {
        if (pokemonName == null) return;

        setSelectedPokemon(undefined);
        setTypeDetails([]);
        setSelectedPokemonNetworkState(NetworkState.Loading);

        const pokeData = await api.getPokemonByName(pokemonName);

        const typeTasks: Array<Promise<Type>> = [];
        for (const type of pokeData.types) {
            typeTasks.push(api.getTypeByName(type.type.name));
        }
        const typeDatas = await Promise.all(typeTasks);

        setSelectedPokemon(pokeData);
        setTypeDetails([...typeDatas]);
        setSelectedPkmnName(pokeData.name)
        setSelectedPokemonNetworkState(NetworkState.Success);
    }

    const selectType = async (type?: string | Array<string>) => {
        setSelectedType(undefined);

        if (type == null) return;
        if (Array.isArray(type)) return;

        setSelectedPokemonNetworkState(NetworkState.Loading);

        const typeData = await api.getTypeByName(type);

        setSelectedType(typeData);
        setSelectedTeraType(typeData.name);
        setSelectedPokemonNetworkState(NetworkState.Success);
    }

    return (
        <>
            <PageHeader text="Tera Raid options"></PageHeader>
            <Container mb="10em" class="tera-raid-options">
                <Show
                    when={networkState() == NetworkState.Success}
                    fallback={<CenterLoading />}
                >
                    <Card>
                        <VStack>
                            <Flex width="100%" justifyContent="end" class="controls noselect">
                                <Box class="list-all">
                                    <Center>
                                        <Text>List all Pokemon</Text>
                                        <Switch
                                            size="lg"
                                            checked={showAllPokemon()}
                                            onChange={(event: any) => {
                                                const newValue = event?.target?.checked ?? false
                                                setShowAllPokemon(newValue);
                                                getPokemon();
                                            }}
                                            variant="outline"
                                        />
                                    </Center>
                                </Box>
                                <Spacer />
                                <Box minWidth="300px">
                                    <Show
                                        when={pokemonNamesNetworkState() == NetworkState.Success}
                                        fallback={<Center><SmolLoadingSpinner /></Center>}
                                    >
                                        <Autocomplete
                                            placeholder="Pokemon"
                                            options={pokemonOptionsToDisplay()}
                                            autocompleteTile={PokemonAutocompleteTile}
                                            selectedValues={selectedPokemon() != null ? [capitalizeFirstLetter(selectedPokemon()!.name)] : undefined}
                                            onSelect={(value: string | string[]) => {
                                                const selectedPoke = pokemonOptions().find(p => p.value == value);
                                                if (selectedPoke == null) return;

                                                getPokemonDetails(selectedPoke.value);
                                            }}
                                        />
                                    </Show>
                                </Box>
                                <Box m="0.33em" class="noselect"></Box>
                                <Box minWidth="300px">
                                    <Show
                                        when={typesNetworkState() == NetworkState.Success}
                                        fallback={<Center><SmolLoadingSpinner /></Center>}
                                    >
                                        <Dropdown
                                            placeholder="Tera Type"
                                            options={types()}
                                            selectedValues={[selectedType()?.id?.toString() as any]}
                                            onSelect={selectType}
                                        />
                                    </Show>
                                </Box>
                            </Flex>
                            <Box m="2" class="noselect">
                                <br />
                            </Box>
                            <Show when={selectedPokemonNetworkState() == NetworkState.Loading}>
                                <Center minH="25vh">
                                    <LoadingSpinner />
                                </Center>
                            </Show>
                            <Show when={selectedPokemonNetworkState() == NetworkState.Success}>
                                <Show
                                    when={selectedPokemon() != null}
                                    fallback={
                                        <Center class="noselect">
                                            <Heading m="1em" size="2xl" textAlign="center">Start by selecting a pokemon and possibly a Tera type</Heading>
                                        </Center>
                                    }
                                >
                                    <PokemonDetails
                                        pokemon={selectedPokemon()!}
                                        selectedType={selectedType()}
                                        typeDetails={typeDetails()}
                                        showAllPokemon={showAllPokemon()}
                                    />
                                </Show>
                            </Show>
                        </VStack>
                    </Card>
                </Show>
            </Container>
        </>
    );
};

export const RedirectToHome: Component = () => {
    const navigate = useNavigate();
    navigate(routes.actualHome);

    return (
        <CenterLoading />
    );
};
