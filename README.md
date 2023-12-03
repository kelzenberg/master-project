# Master Project

> [Berliner Hochschule für Technik](https://bht-berlin.de/en) in cooperation with [Fritz-Haber-Institut](https://www.fhi.mpg.de).

---

Everything you need to run and develop this project is described in this README and the READMEs inside the `./packages/**` folders.

---

## Prerequisites

Before you start...

### Requirements

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en) version `^21.1.x`
  - Including [NPM](https://www.npmjs.com/package/npm) version `^10.2.x`
  - [Optional] [nvm](https://github.com/nvm-sh/nvm) to switch Node versions, see `.nvmrc`

### Recommendations

- [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/).  
  Plus [ESLint Extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint/), [Prettier Extension](https://open-vsx.org/vscode/item?itemName=esbenp.prettier-vscode), [EditorConfig Extension](https://open-vsx.org/vscode/item?itemName=EditorConfig.EditorConfig), [DotENV](https://open-vsx.org/vscode/item?itemName=mikestead.dotenv).  
  Preferred VSCodium/VSCode settings:

  ```json
  // Add this to user settings to auto-lint on Save
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
  ],
  ```

## Monorepo Usage

This project is **split into several packages**, each of which fulfills a part of the software's intended purpose. They stand on its own as complete software but their content can be imported/used across the whole repository. In doing so this repository becomes a [monorepo](https://monorepo.tools).

### First Steps

Compare your local NodeJS version via `node -v` with the required version above.  
Then run `npm install` once to install all dependencies.

### Packages

### [@master-project/frontend](https://github.com/kelzenberg/master-project/tree/main/packages/frontend)

**Simulation visualization layer for the web browser**

Usage: `npm run F {dev|build|start}`  
Install NPM dependencies: `npm run install:F {dependency-name}`  
Remove NPM dependencies: `npm run remove:F {dependency-name}`

### [@master-project/backend](https://github.com/kelzenberg/master-project/tree/main/packages/backend)

**Backend server to manage the communication** between simulation and frontend

Usage: `npm run B {dev|build|start}`  
Install NPM dependencies: `npm run install:B {dependency-name}`  
Remove NPM dependencies: `npm run remove:B {dependency-name}`

### [@master-project/libs](https://github.com/kelzenberg/master-project/tree/main/packages/libs)

**Shared modules and data**

Usage: `npm run L {build}`  
Install NPM dependencies: `npm run install:L {dependency-name}`  
Remove NPM dependencies: `npm run remove:L {dependency-name}`

#### Notes on Packages

- You will find each package inside the packages folder within their own subfolder.  
  _Example_ `./packages/frontend`
- Each package has their own README,  
  _Example_ `./packages/frontend/README.md`
- Each package has their own individual configuration files.  
  _Example_ `./packages/frontend/vite.config.js`
- Generic configuration files are located on the root level of the repository and are valid for **all** packages.  
  _Example_ `./eslintrc.json`
- Install NPM dependencies only in their respective workspace.  
  _Example_ `ThreeJS` only belongs in `@master-project/frontend`.

### Global Commands

These NPM commands will be executed for ALL packages.

- Remove build artifacts and more

  ```sh
  npm run clean
  ```

- Lint source files in all packages

  ```sh
  npm run lint
  # to fix errors directly:
  npm run lint:fix
  ```

- Format source files in all packages
  ```sh
  npm run format
  ```

**Note:**  
You can run NPM commands consecutively for all packages by adding a `--workspaces` to it. **All packages** need to be able to run this NPM command though (check package's respective `package.json` if the command is present).

## Documentation

With the exception of this README and the package's READMEs, the entire project documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

**Editor tip:**  
Clone the wiki to edit pages locally in your editor.

```sh
git clone https://github.com/kelzenberg/master-project.wiki.git
```
