# Master Project

Master Project at Berliner Hochschule für Technik.

## Develop the project

> Everything you need to contribute code and run this project locally.

### Prerequisites

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en)
  - Version in `.nvmrc` (`^21.1.x`)
  - Including [NPM](https://www.npmjs.com/package/npm) version `^10.2.x`
  - Optional: [nvm](https://github.com/nvm-sh/nvm) to switch Node versions

### Editor Recommendation

- [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/)

  - [ESLint Extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint/)
  - [Prettier Extension](https://open-vsx.org/vscode/item?itemName=esbenp.prettier-vscode)
  - [EditorConfig Extension](https://open-vsx.org/vscode/item?itemName=EditorConfig.EditorConfig)
  - [DotENV](https://open-vsx.org/vscode/item?itemName=mikestead.dotenv)
  - Optional VSCodium/VSCode settings:

    ```json
    // Add this to user settings to auto-lint on Save

    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "eslint.validate": [
      "vue",
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact"
    ],
    ```

## Packages

This project is **split into several packages**, each of which fulfills a part of the software's intended purpose. They stand on its own as complete software but their content can be imported/used across the whole repository.  
In doing so this repository becomes a [monorepo](https://monorepo.tools).

You will find each package inside the `./packages` folder within their own subfolder. Each package has their own individual configuration files. Generic configuration files are located on the root level of the repository and are valid for all packages.

---

### [@master-project/frontend](https://github.com/kelzenberg/master-project/tree/main/packages/frontend)

**Simulation visualization layer for the web browser**

Usage: `npm run F {dev|build|start|lint|lint:fix|format}`

### [@master-project/backend](https://github.com/kelzenberg/master-project/tree/main/packages/backend)

**Backend server to manage the communication** between simulation and frontend

Usage: `npm run B {dev|build|start|lint|lint:fix|format}`

### [@master-project/libs](https://github.com/kelzenberg/master-project/tree/main/packages/libs)

**Shared modules and data**

Usage: `npm run L {build|lint|lint:fix|format}`

---

**Hint:** You can run an npm command that is supported by all packages by adding a `--workspaces` to it.

- Lint source files in all packages

  ```sh
  npm run --workspaces lint
  # to fix errors directly:
  npm run --workspaces lint:fix
  ```

- Format source files in all packages
  ```sh
  npm run --workspaces format
  ```

## Documentation

With the exception of this Readme and the package's Readmes, the entire project documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

**Editor tip:**  
Clone the wiki to edit pages locally in your editor.

```sh
git clone https://github.com/kelzenberg/master-project.wiki.git
```
