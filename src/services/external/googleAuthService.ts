import * as jose from 'jose';
import { Container, Service } from 'typedi';
import { OAuthProviderType, OAuthUserViewModel } from '@assistantapps/assistantapps.api.client';

import { AuthedAssistantAppsApiService, getAssistantAppsApi } from '../api/assistantAppsApiService';
import { ConfigService, getConfig } from '../internal/configService';

interface IGoogleAuthResponse {
    clientId: string;
    client_id: string;
    credential: string;
    select_by: string;
}

@Service()
export class GoogleAuthService {
    private _config: ConfigService;
    private _aaService: AuthedAssistantAppsApiService;

    constructor() {
        this._config = getConfig();
        this._aaService = getAssistantAppsApi();
    }

    init = (
        loginStarted: () => void,
        navigateOnSuccess: () => void
    ) => {
        window.google.accounts.id.initialize({
            client_id: this._config.getGoogleClientId(),
            callback: this.handleResponse(loginStarted, navigateOnSuccess),
        });
    }

    initButton = (
        elemId: string,
        loginStarted: () => void,
        navigateOnSuccess: () => void
    ) => {
        this.init(loginStarted, navigateOnSuccess);
        window.google.accounts.id.renderButton(
            document.getElementById(elemId),
            {
                theme: 'filled_black',
                size: 'large',
                shape: 'pill',
                text: 'continue_with'
            }
        );
    }

    promptUser = () => {
        window.google.accounts.id.prompt();
    }

    handleResponse = (
        loginStarted: () => void,
        navigateOnSuccess: () => void,
    ) => async (data: IGoogleAuthResponse) => {
        loginStarted();
        const responsePayload = jose.decodeJwt(data.credential);

        const userVm: OAuthUserViewModel = {
            accessToken: data.credential,
            email: responsePayload.email as any,
            oAuthType: OAuthProviderType.google,
            profileUrl: responsePayload.picture as any,
            tokenId: data.credential,
            username: responsePayload.name as any,
        };
        const oauthResult = await this._aaService.loginWithGoogleAuth(userVm);
        if (oauthResult.isSuccess) {
            navigateOnSuccess();
        }
    }
}

export const getGoogleAuth = () => Container.get(GoogleAuthService);
