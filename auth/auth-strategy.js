/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const passport = require('passport');
const appID = require('ibmcloud-appid');

const { jwtAuthenticate, jwtVerify } = require('./jwt-auth');

const { APIStrategy } = appID;

const STRATEGY_TYPE = {
    DEVELOPMENT: "DEVELOPMENT",
    KEYCLOAK: "KEYCLOAK",
    APPID: "APPID"
}
if (!process.env.AUTH_STRATEGY) {
    process.env.AUTH_STRATEGY = STRATEGY_TYPE.APPID; // default
}

if ((process.env.AUTH_STRATEGY !== STRATEGY_TYPE.DEVELOPMENT && process.env.AUTH_STRATEGY !== STRATEGY_TYPE.KEYCLOAK)) {
    passport.use(new APIStrategy({ oauthServerUrl: process.env.APP_ID_URL }));
}

class AuthStrategyFactory {
    constructor() {
        this.authStrategy = process.env.AUTH_STRATEGY;
    }

    getAuthStrategy(scopeName) {
        if (this.authStrategy && this.authStrategy.toUpperCase() === STRATEGY_TYPE.DEVELOPMENT) {
            return jwtAuthenticate;
        }
        const options = { session: false };

        if (this.authStrategy && this.authStrategy.toUpperCase() === STRATEGY_TYPE.KEYCLOAK) {
            const secretOrPubKey = process.env.KEYCLOAK_REALM_CERT;
            const opts = {
                algorithms: ['RS256', 'HS256'],
                ignoreExpiration: false,
                issuer: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM_NAME}`,
                passReqToCallback: false,
            };
            return jwtVerify(scopeName, secretOrPubKey, opts);
        }
        if (scopeName) {
            options.scope = scopeName;
        }
        return passport.authenticate(APIStrategy.STRATEGY_NAME, options);
    }
    checkPayloadExists(payload) {
        if (!payload || !payload.accessTokenPayload) {
            throw new Error("accessTokenPayload is missing")
        }
    }
    isAdminScope(req, adminScope) {
        let scope;
        if (this.authStrategy === STRATEGY_TYPE.APPID) {
            this.checkPayloadExists( req.appIdAuthorizationContext)
            scope = req.appIdAuthorizationContext.accessTokenPayload.scope;
        } else if (this.authStrategy === STRATEGY_TYPE.KEYCLOAK || this.authStrategy === STRATEGY_TYPE.DEVELOPMENT) {
            this.checkPayloadExists( req.auth)
            scope =  req.auth.accessTokenPayload.scope
        }
        return scope.includes(adminScope)
    }
}


module.exports = new AuthStrategyFactory();
