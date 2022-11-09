/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const axios = require('axios')
const querystring = require('querystring')
const { Logger } = require('dhp-logging-lib');

const logger = new Logger('keycloak-helper');

const RequiredConfigs = [
    'KEYCLOAK_REALM_CERT',
    'KEYCLOAK_AUTH_SERVER_URL',
    'KEYCLOAK_REALM_NAME',
    'KEYCLOAK_CLIENT_ID',
    'KEYCLOAK_CLIENT_SECRET'
];

// eslint-disable-next-line complexity
const validateConfig = (baseURL) => {
    logger.debug(`Using Keycloak baseURL ${baseURL}`);
    for (const envKey of RequiredConfigs) {
        if (!process.env[envKey]) {
            throw new Error(`Invalid Keycloak config: missing environment var: '${envKey}'`)
        }
    }
    logger.debug(`Using Keycloak baseURL ${this._kcBaseURL}`);
}

class KeycloakHelper {
    constructor({ timeout, retries, retryDelay }) {
        this._timeout = timeout || 1;
        this._retries = retries;
        this._retryDelay = retryDelay || 3000;
        this._serverUrl = process.env.KEYCLOAK_AUTH_SERVER_URL;
        this._realmName = process.env.KEYCLOAK_REALM_NAME;
        this._clientId = process.env.KEYCLOAK_CLIENT_ID;
        this._clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
        this._kcBaseURL = `${this._serverUrl}/realms/${this._realmName}`;
        validateConfig(this._kcBaseURL);

        // kcBaseURL: `${serverUrl}/${realmName}`,
        this._keycloakApiInstance = axios.create({
            baseURL: `${this._kcBaseURL}`,

            timeout, // todo config.appID.timeout
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                accept: 'application/json',
            },
        })

    }

    userLogin = (userData) => {
        const { email, password } = userData
        const requestBody = {
            mode: 'raw',
            grant_type: 'password',
            client_id: this._clientId,
            username: email,
            password,
            client_secret: this._clientSecret
        }

        return this._callKeycloakOpenidToken(requestBody);
    }

    loginAsClientCredentialGrant = () => {

        const grantType = 'client_credentials';
        const requestBody = {
            grant_type: grantType,
            client_id: this._clientId,
            client_secret: this._clientSecret
        }
        return this._callKeycloakOpenidToken(requestBody);
    }

    _callKeycloakOpenidToken = async (requestBody) => {
        try {
            const grantType = requestBody.grant_type;
            logger.debug(`Calling Keycloak for ${grantType} auth token`);
            const response = await this._keycloakApiInstance.post(
                '/protocol/openid-connect/token',
                querystring.stringify(requestBody));
            logger.info(`Keycloak request success grantType: ${grantType}`);

            if (response.status !== 200) {
                return {
                    status: response.status || 400,
                    message: response.data ? JSON.stringify(response.data) : "Keycloak request failed"
                }
            }
            return response.data;
        } catch (error) {
            logger.error(`Login request to Keycloak failed with error ${error}`);
            const errorObj = new Error();
            if (error.response) {
                const errorResponse = error.response;
                errorObj.status = errorResponse.status;
                errorObj.statusText = errorResponse.statusText;
                if ('data' in errorResponse) {
                    errorObj.message = errorResponse.data.error_description;
                }
            } else {
                errorObj.status = 500;
                errorObj.statusText = error.code;
                errorObj.message = error.message;
            }
            throw errorObj;
        }
    }
}


module.exports = { KeycloakHelper, validateConfig }