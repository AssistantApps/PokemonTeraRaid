import { anyObject } from "../../../helper/typescriptHacks";
import { IState } from "../initialState";
import { StateService } from "../stateService";

export interface ITeraRaidState {
    listAllPokemon?: boolean;
    selectedPokemonName?: string;
    selectedTeraType?: string;
}

const handleNestedNotExisting = (s: IState) => {
    if (s.teraRaid == null) {
        s.teraRaid = anyObject;
    }
}

export const getListAllPokemon = (stateService: StateService): [state: () => boolean, setState: (state: boolean) => void] => [
    () => stateService.getState().teraRaid?.listAllPokemon ?? false,
    (listAllPokemon: boolean) => stateService.setState(s => {
        handleNestedNotExisting(s);
        s.teraRaid.listAllPokemon = listAllPokemon;
    }),
];

export const getSelectedPokemon = (stateService: StateService): [state: () => string | undefined, setState: (state: string) => void] => [
    () => stateService.getState().teraRaid?.selectedPokemonName,
    (selectedPokemon: string) => stateService.setState(s => {
        handleNestedNotExisting(s);
        s.teraRaid.selectedPokemonName = selectedPokemon;
    }),
];

export const getSelectedTeraType = (stateService: StateService): [state: () => string | undefined, setState: (state: string) => void] => [
    () => stateService.getState().teraRaid?.selectedTeraType,
    (selectedTeraType: string) => stateService.setState(s => {
        handleNestedNotExisting(s);
        s.teraRaid.selectedTeraType = selectedTeraType;
    }),
];