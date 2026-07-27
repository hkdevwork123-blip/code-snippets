---
outline: deep
---

# Backstage

Open platform devloped by Spotify for creating developer portals. The main goal is to centralise all of the tooling, software components, data and documentaion for an organistation into one place.

## The Basics

Set the project up by running the below. There are some nice docs [here](https://backstage.spotify.com/learn/standing-up-backstage/standing-up-backstage/1-intro/) for further updating the basic config

```bash
npx @backstage/create-app@latest
```

You may run into the below error

```
Error: Could not execute command yarn install

It seems that something went wrong when creating the app 🤔

🔥  Failed to create app!
```

Make sure you read the error message it gives you. In my case I had to update node

```
error @yarnpkg/parsers@3.0.0-rc.51: The engine "node" is incompatible with this module. Expected version ">=18.12.0". Got "16.15.0"
error Found incompatible module.
```

### Updating Node

Install [nvm](https://github.com/nvm-sh/nvm#install--update-script)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

This will then spit out the below, copy this and run it....

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
```

Then we can update node to the speciic version that backstage requires "">=18.12.0""...
If you have multiple versions installed in might default back to the higher version so just run the install again and this will set the version

```bash
nvm install 18.12.0
```

Just as a note to get install latest node version just run the below..

```bash
nvm install node
```

Check the version to confirm installation

```bash
node -v
```

### Run the app

cd into the working directory and run the below. The default behavior is to load app-config.yaml and, if it exists, app-config.local.yaml from the repo root.

```bash
npm run dev
```

Or use yarn

```bash
yarn dev
```

If any config flags are provided, the default app-config.yaml files are NOT loaded. To include them you need to explicitly include them with a flag, for example:

```bash
 yarn start --config ../../app-config.yaml --config ../../app-config.local.yaml
```
