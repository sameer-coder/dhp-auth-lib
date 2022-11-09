/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const jwt = require('jsonwebtoken');
const { Logger } = require('dhp-logging-lib');
const { validateConfig } = require('../helper/keycloakHelper');

const logger = new Logger({ name: 'jwt-auth' });

const jwtAuthenticate = (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (secret && secret.length === 0) {
            throw new Error("Invalid config: missing environment variable JWT_SECRET");
        }
        const token = req.headers.authorization.replace(/Bearer ?/g, '');
        const decoded = jwt.verify(token, secret);
        req.auth = {
            email: decoded.email,
            sub: decoded.sub,
            given_name: decoded.given_name,
            family_name: decoded.family_name,
            tenant: decoded.tenant,
            name: decoded.name,
            organization: decoded.organization,
        };
        next()
    } catch (error) {
        logger.error(`JWT auth error ${error.message}`);
        return res.status(401).json({ message: "Authorization failed"});
    }
}

const jwtVerify = (scopeName, secretOrPubKey, opts) => {
    validateConfig(opts.issuer)
    return function (req, res, next) {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({ message: 'Authorization token is missing' });
            }
            const token = req.headers.authorization.replace(/Bearer ?/g, '');
            const decoded = jwt.verify(token, secretOrPubKey, opts);
            if (!decoded || (decoded.scope && decoded.scope.search(scopeName) === -1)) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.auth = {
                accessTokenPayload: decoded
            }
            next();
        } catch (e) {
            logger.error(`JWT keycloak auth error ${e.message}`);
            if (e instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            next(e)
        }
    }
}

module.exports = {
    jwtAuthenticate,
    jwtVerify
};
