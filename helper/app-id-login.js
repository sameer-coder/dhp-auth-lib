/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const axios = require('axios');
const rax = require('retry-axios');
const querystring = require('querystring');
const { Logger } = require('dhp-logging-lib');

const logger = new Logger({ name: 'authlib-appid-login' });

const url = process.env.APP_ID_URL;
const clientID = process.env.APP_ID_CLIENT_ID;
const tenantID = process.env.APP_ID_TENANT_ID;
const secret = process.env.APP_ID_SECRET;

const APPID_REQUIRED_CONFIGS = [
    "APP_ID_URL",
    "APP_ID_CLIENT_ID",
    "APP_ID_TENANT_ID",
    "APP_ID_SECRET",
]
// eslint-disable-next-line max-len
const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

class AppIDHelper {
    constructor({ timeout, retries, retryDelay }) {
        this._timeout = timeout || 1;
        this._retries = retries;
        this._retryDelay = retryDelay || 3000;

        this._validateConfig();
    };

    _validateConfig() {
        for (const confKey of APPID_REQUIRED_CONFIGS) {
            if (!process.env[confKey]) {
                this.missingVar = confKey
            }
        }
        
        if (this.missingVar) {
            throw new Error(`Invalid AppID config: missing variable '${this.missingVar}`);
        }
    };

    _appIdLoginClient() {
        const loginClient = axios.create({
            baseURL: `${url}/token`,
            timeout: this._timeout,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                accept: 'application/json',
            },
            auth: {
                username: clientID,
                password: secret,
            },
        });

        // setup retry-axios config
        loginClient.defaults.raxConfig = {
            instance: loginClient,
            retry: this._retries,
            backoffType: 'static', // options are 'exponential' (default), 'static' or 'linear'
            noResponseRetries: this._retries, // retry when no response received (such as on ETIMEOUT)
            statusCodesToRetry: [[500, 599]], // retry only on 5xx responses (no retry on 4xx responses)
            retryDelay: this._retryDelay,
            httpMethodsToRetry: ['POST', 'GET', 'HEAD', 'PUT'],
            onRetryAttempt: (err) => {
                const cfg = rax.getConfig(err);
                logger.warn('No response received from AppID, retrying login request:');
                logger.warn(`Retry attempt #${cfg.currentRetryAttempt}`);
            },
        };

        rax.attach(loginClient);
        return loginClient;
    };
    
    _getUserInfoJwt(){
        return {
            sub: '1d44cdc1-4b78-4ef7-a5a2-08aabc13619f',
            name: 'Tester POC',
            email: 'tester@poc.com',
            given_name: 'Tester',
            family_name: 'POC',
        }
    }
    
    async _getUserInfoAppId (token) {
        try {
            this._validateConfig();
            const appIdInfo = this.appIdUserInfoClient(token);
            const userInfo = await appIdInfo.post('/');
            return userInfo.data;
        } catch (error) {
            const errorObj = new Error();
            if (error.response) {
                errorObj.status = error.response.status;
                errorObj.statusText = error.response.statusText;
                errorObj.message = error.data.error_description;
            } else {
                errorObj.status = 500;
                errorObj.statusText = error.code;
                errorObj.message = error.message;
            }
            
            throw errorObj;
        }
    };
    
    appIdUserInfoClient(token) {
        return axios.create({
            baseURL: `${url}/userinfo`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                Authorization: token,
            },
        });
    }
    
    async loginAsClientCredentialGrant() {
        try {
            const grantType = 'client_credentials';
            
            const requestBody = {
                grant_type: grantType
            }
            logger.debug(`Calling AppID for ${grantType} auth token`);
            const response = await this._appIdLoginClient().post('/', querystring.stringify(requestBody));
            logger.info(`AppID request success grantType: ${grantType}`);
            
            return response.data;
        } catch (error) {
            logger.error(`Login request to AppID failed with error ${error}`);
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
    };
    
    // eslint-disable-next-line complexity
    async appIDLogin(email, password) {
        if (!email || !password || !emailRegex.test(email)) {
            throw new Error({
                status: 401,
                message: "The email or password that you entered is incorrect.",
            });
        }

        try {

            const loginClient = this._appIdLoginClient();
            // TODO: we will eventually get a client_credential request from the mobile app,
            // but for now, we need to fake it.
            const useClientCred = (email === 'tester@poc.com' && password === 'testing123');
            const requestBody = useClientCred ?
                {
                    grant_type: 'client_credentials'
                }
                :
                {
                    username: email,
                    password,
                    grant_type: 'password',
                }
            logger.debug('AppID call for token auth');
            const response = await loginClient.post('/', querystring.stringify(requestBody));
            logger.info('AppID login successful');
            // TODO: this is a dummy hardcoded value required by the mobile app.  We will remove this
            if (useClientCred) {
                // eslint-disable-next-line max-len
                response.data.id_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTQwOTRkYWIyLWU2MmEtNGQzZC04OGFkLWM5NzlkNjMzNjAyYS0yMDIwLTA3LTI5VDE3OjM1OjQ4LjQyNyIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvNDA5NGRhYjItZTYyYS00ZDNkLTg4YWQtYzk3OWQ2MzM2MDJhIiwiYXVkIjpbIjYxNjRmMTNmLWU1OGQtNGVhMy04YjhhLWJkMzhjNzEzY2M5MyJdLCJleHAiOjE2MTMwOTYyNTMsInRlbmFudCI6IjQwOTRkYWIyLWU2MmEtNGQzZC04OGFkLWM5NzlkNjMzNjAyYSIsImlhdCI6MTYxMzA4MTg1MywiZW1haWwiOiJ0ZXN0ZXJAcG9jLmNvbSIsIm5hbWUiOiJUZXN0ZXIgUE9DIiwic3ViIjoiYTIwNDgzMjEtZTY0YS00YjcyLWJiMzYtNmNhMjQ0M2NmOWEyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdpdmVuX25hbWUiOiJUZXN0ZXIiLCJmYW1pbHlfbmFtZSI6IlBPQyIsImlkZW50aXRpZXMiOlt7InByb3ZpZGVyIjoiY2xvdWRfZGlyZWN0b3J5IiwiaWQiOiI4ZWQ5MThiMC02MzkzLTQ3OGItODA0Ni0wNWMwNTA5Njc3OGQifV0sImFtciI6WyJjbG91ZF9kaXJlY3RvcnkiXX0.TuYkkS38B-6BdjCiORbiR5lyoptBfM-hjuzWx9xiB2v8bptvfGD3d_qKWenOmuX9XaLTprOlL1zDOzeTLLRY6VzAXRyLyuGzBBL9mpmIeISv3VUuAEJOB9LrMaz9WuHhfVj5-PR4GAfny23SXLI_qbLVr8Hafj7sflcD5y8WlcR2L4Z2-_heyjmMrwYmYmNpOSBhmbPej2rAAnDyUUni7rA2J0J5JRP3TmGO6NXsFwyuiExadOD0-4a_WTr5HNJzv4X8Fb9yG3X6VmHGJWFzn1wbrjwbCLYrCxISsOMcyKBeABAWpSO3DxbFAXRiJm5_4hKowqYp0A8oTTsGBvOgOQ';
                // eslint-disable-next-line max-len
                response.data.scope = 'openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated';
            }
            return response.data;
        } catch (error) {
            const errorObj = new Error();
            if (error.response) {
                const errorResponse = error.response;
                errorObj.status = errorResponse.status;
                errorObj.statusText = errorResponse.statusText;
                if ('data' in errorResponse) {
                    errorObj.message = errorResponse.data.error_description;
                }
            } else {
                logger.error(`AppIDLogin call error ${error.message}`);
                errorObj.status = 500;
                errorObj.statusText = error.code;
                errorObj.message = error.message;
            }
            throw errorObj;
        }
    };
    
    getUserInfo = (token) => {
        return process.env.AUTH_STRATEGY === 'DEVELOPMENT' ? this._getUserInfoJwt() : this._getUserInfoAppId(token);
    };
    
}


module.exports = AppIDHelper;
