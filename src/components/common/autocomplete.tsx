import { Flex, FormControl, FormLabel, Image, Input, Select, SelectContent, SelectIcon, SelectListbox, SelectOption, SelectOptionIndicator, SelectOptionText, SelectPlaceholder, SelectTrigger, SelectValue, Tag, TagLabel, Text } from "@hope-ui/solid";
import { Accessor, Component, createEffect, createSignal, For, JSX, Show } from "solid-js";
import { CustomImage } from "./image";

export interface IAutocompleteOption {
    title: string;
    value: string;
    image?: string;
}

interface IProps {
    title?: string;
    placeholder?: string;
    multiple?: boolean;
    selectedValues?: Array<string>;
    options: Array<IAutocompleteOption>;
    autocompleteTile?: (item: IAutocompleteOption, index: Accessor<number>) => JSX.Element;
    onSelect?: (values: string | Array<string>) => void;
}

export const Autocomplete: Component<IProps> = (props: IProps) => {
    const [selectedOptions, setSelectedOptions] = createSignal(props.selectedValues ?? [], { equals: false });
    const [optionsToDisplay, setOptionsToDisplay] = createSignal<Array<IAutocompleteOption>>(props.options);
    const [searchText, setSearchText] = createSignal<string>('');

    createEffect(() => {
        setSelectedOptions(props.selectedValues ?? []);
    })

    const onSelectOption = (selectedOpts: any) => {
        setSearchText('');
        setSelectedOptions(selectedOpts);
        props.onSelect?.(selectedOpts);
    }

    return (
        <FormControl>
            <Show when={props.title != null}>
                <FormLabel>{props.title}</FormLabel>
            </Show>
            <Select
                variant="unstyled"
                multiple={props.multiple}
                value={selectedOptions()}
                onChange={onSelectOption}
            >
                <SelectTrigger onKeyDown={() => { }}>
                    <Input
                        placeholder={props.placeholder ?? ''}
                        value={searchText()}
                        onInput={(event) => {
                            const searchStr = event.target.value;
                            if (searchStr.length < 1) {
                                setOptionsToDisplay(props.options);
                                return;
                            }

                            setSearchText(searchStr);
                            setOptionsToDisplay(
                                props.options.filter(p => p.value.includes(searchStr))
                            );
                        }}
                    />
                </SelectTrigger>
                <SelectContent onKeyDown={() => { }}>
                    <SelectListbox onKeyDown={() => { }}>
                        <For each={optionsToDisplay()}>
                            {props.autocompleteTile ?? (item => (
                                <SelectOption value={item.value}>
                                    <Show when={item.image != null}>
                                        <CustomImage
                                            src={item.image}
                                            alt={item.title}
                                            borderRadius={5}
                                            maxHeight="2em"
                                            maxWidth="2em"
                                            ml="0.5em"
                                        />
                                    </Show>
                                    <SelectOptionText>{item.title}</SelectOptionText>
                                    <SelectOptionIndicator />
                                </SelectOption>
                            ))}
                        </For>
                    </SelectListbox>
                </SelectContent>
            </Select>
        </FormControl>
    );
}