# Digital Healthpass auth lib

## Introduction

This DHP shared library contains common code for authentication/authorization used by Nodejs based service backends. Supported Identity Provider include IBM App ID and Keycloak.
### Environment Variables

The following environment variables is used for auth functionality:

| Environment Variable | Value                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| LOG_LEVEL            | Standard log4js log levels.  debug, info, error, etc.                                          |
| AUTH_STRATEGY        | DEVELOPMENT or KEYCLOAK or APPID                                                               |
| APP_ID_URL              | The App ID URL found in IBM Cloud service credentials oauthServerUrl value                          |
| APP_ID_TENANT_ID        | The App ID URL found in IBM Cloud service credentials tenantId value                        |
| APP_ID_CLIENT_ID        | App ID instance clientID                                                                    |
| APP_ID_SECRET           | App ID instance secret                                                                      |

#### For Keycloak as Identity provider

| Environment Variable    | Value                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| KEYCLOAK_AUTH_SERVER_URL   | Keycloak Server URL                                             |
| KEYCLOAK_REALM_NAME        | Keycloak Realm name for auth                                    |
| KEYCLOAK_REALM_CERT       | Keycloak Realm Certificate                                             |
| KEYCLOAK_CLIENT_ID        | Keycloak instance Client ID                                                                      |
| KEYCLOAK_CLIENT_SECRET    | Keycloak instance client secret                                                                   |


## Build
```
npm install
```

## Library dependency Licenses

This section lists license details of libraries / dependencies.

| Name                        | License type | Link                                                                 |
| :-------------------------- | :----------- | :------------------------------------------------------------------- |
| axios                       | MIT          | git+https://github.com/axios/axios.git                               |
| ibmcloud-appid              | Apache-2.0   | git+https://github.com/ibm-cloud-security/appid-serversdk-nodejs.git |
| jsonwebtoken                | MIT          | git+https://github.com/auth0/node-jsonwebtoken.git                   |
| log4js                      | Apache-2.0   | git+https://github.com/log4js-node/log4js-node.git                   |
| keycloak-connect            | Apache-2.0   | git+https://github.com/keycloak/keycloak-nodejs-connect.git          |
| passport                    | MIT          | git://github.com/jaredhanson/passport.git                            |
| retry-axios                 | Apache-2.0   | git+https://github.com/JustinBeckwith/retry-axios.git                |
| uuid                        | MIT          | git+https://github.com/uuidjs/uuid.git                               |
| babel-eslint                | MIT          | git+https://github.com/babel/babel-eslint.git                        |
| chai                        | MIT          | git+https://github.com/chaijs/chai.git                               |
| eslint                      | MIT          | git+https://github.com/eslint/eslint.git                             |
| eslint-config-airbnb        | MIT          | git+https://github.com/airbnb/javascript.git                         |
| eslint-config-airbnb-base   | MIT          | git+https://github.com/airbnb/javascript.git                         |
| eslint-config-node          | ISC          | git+https://github.com/kunalgolani/eslint-config.git                 |
| eslint-config-prettier      | MIT          | git+https://github.com/prettier/eslint-config-prettier.git           |
| eslint-plugin-chai-friendly | MIT          | git+https://github.com/ihordiachenko/eslint-plugin-chai-friendly.git |
| eslint-plugin-import        | MIT          | git+https://github.com/import-js/eslint-plugin-import.git            |
| eslint-plugin-jsx-a11y      | MIT          | git+https://github.com/jsx-eslint/eslint-plugin-jsx-a11y.git         |
| eslint-plugin-node          | MIT          | git+https://github.com/mysticatea/eslint-plugin-node.git             |
| eslint-plugin-prettier      | MIT          | git+https://github.com/prettier/eslint-plugin-prettier.git           |
| eslint-plugin-react         | MIT          | git+https://github.com/jsx-eslint/eslint-plugin-react.git            |
| eslint-plugin-react-hooks   | MIT          | git+https://github.com/facebook/react.git                            |
| husky                       | MIT          | git+https://github.com/typicode/husky.git                            |
| mocha                       | MIT          | git+https://github.com/mochajs/mocha.git                             |
| prettier                    | MIT          | git+https://github.com/prettier/prettier.git                         |