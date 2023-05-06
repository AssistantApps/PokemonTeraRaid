import { Flex, Heading } from "@hope-ui/solid";
import { Component } from "solid-js";
import { getStateService } from "../../services/store/stateService";

interface IProps {
    text: string
}

export const PageHeader: Component<IProps> = (props: IProps) => {
    const authObj = getStateService().getState().auth;

    return (
        <Flex
            class="page-title noselect"
            position="relative"
            direction="row"
            justifyContent="center"
            paddingTop="2em"
            mb="1em"
        >
            <Heading size="3xl">{props.text}</Heading>
        </Flex>
    );
}