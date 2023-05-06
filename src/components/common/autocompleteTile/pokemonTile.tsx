import { SelectOption, SelectOptionIndicator, SelectOptionText } from "@hope-ui/solid";
import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { Component, Show } from "solid-js";
import { IAutocompleteOption } from "../autocomplete";
import { CustomImage } from "../image";



export const PokemonAutocompleteTile: Component<IAutocompleteOption> = (props: IAutocompleteOption) => {
    const useVisibilityObserver = createVisibilityObserver({ threshold: 0.15 });
    const visible = useVisibilityObserver(() => el);

    let el: HTMLDivElement | undefined;

    return (
        <SelectOption ref={el} value={props.value}>
            <Show
                when={visible()}
                fallback={<>
                    <SelectOptionText ml="2.5em">{props.title}</SelectOptionText>
                    <SelectOptionIndicator />
                </>}
            >
                <Show when={props.image != null}>
                    <CustomImage
                        src={props.image}
                        alt={props.title}
                        borderRadius={5}
                        maxHeight="2em"
                        maxWidth="2em"
                        ml="0.5em"
                    />
                </Show>
                <SelectOptionText>{props.title}</SelectOptionText>
                <SelectOptionIndicator />
            </Show>
        </SelectOption>
    );
}