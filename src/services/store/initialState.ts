import { ISidebarState } from "./sections/sidebarState";
import { ITeraRaidState } from "./sections/teraRaidState";

export interface IState {
    sidebar: ISidebarState;
    teraRaid: ITeraRaidState;
}

export const initialState: IState = {
    sidebar: {
        isOpen: true,
    },
    teraRaid: {
        //
    }
}

// export const getUiScale = (stateService: StateService): [state: () => number, setState: (state: number) => void] => [
//     () => stateService.getState().uiScale,
//     (uiScale: number) => stateService.setState(s => s.uiScale = uiScale),
// ];
