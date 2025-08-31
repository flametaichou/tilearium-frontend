# tilearium-frontend-ts

This repository contains the Tilearium frontend variant, written in TypeScript. Check the [main repository](https://github.com/flametaichou/tilearium) for more information.


## Development environment

Tested in the following environment:
- Node v24.6.0  
- NPM v11.5.2  

## Project setup

Copy the `.env` file to `.env.local`. Fill the required params:

- `VUE_APP_API_URL`- Tilearium server API URL
- `VUE_APP_AUTH_SERVER_URL`- OIDC identity provider URL
- `VUE_APP_AUTH_CLIENT_ID`- OIDC identity provider client ID

You can also fill the optional parameters:
- `VUE_APP_AUTH_NAME`- Identity provider name (will be used on login button)
- `VUE_APP_AUTH_COLOR`- Login button color
- `VUE_APP_AUTH_TEXT_COLOR`- Login button text color
- `VUE_APP_AUTH_ICON`- Login button icon URL

Install dependencies:
```bash
npm install
```

## Run and development

Compile and start hot-reloads:
```bash
npm run serve
```

## Before commit

Run static code analysis:
```bash
npm run lint
```

## Build

Build application:
```bash
npm run build
```

After the successful build, the resulting static files can be found in the `dist` directory.

## Deploy

Basically, any web server can be used to host the resulting static files.

Currently it's deployed together with the backend, to check the main repo for details. 

But there are plans to create a separate frontend container.

## Technological stack

- [Vue.js 3](https://vuejs.org/) + [Vue CLI](https://cli.vuejs.org/)
- [PixiJS 7](https://pixijs.com/)
- SockJS ([sockjs-client](https://github.com/sockjs/sockjs-client)) + STOMP ([webstomp-client](https://github.com/JSteunou/webstomp-client))
- [Vuex](https://vuex.vuejs.org/)


