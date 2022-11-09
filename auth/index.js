/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { jwtAuthenticate, jwtVerify } = require('./jwt-auth');
const authStrategyFactory  = require('./auth-strategy');

module.exports = { jwtAuthenticate, jwtVerify, authStrategyFactory };
