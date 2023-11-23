# Master Project

Master Project at Berliner Hochschule für Technik.

## Develop the project

> Everything you need to contribute code and run this project locally.

### Prerequisites

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en), version according to `.nvmrc`
  - Optional: [nvm](https://github.com/nvm-sh/nvm) to manage Node versions

### Editor Recommendation

- [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/)

  - [ESLint Extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint/)
  - [Prettier Extension](https://open-vsx.org/vscode/item?itemName=esbenp.prettier-vscode)
  - [EditorConfig Extension](https://open-vsx.org/vscode/item?itemName=EditorConfig.EditorConfig)
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

### Scripts

Run `npm install` once to install dependencies.

- Start development-only server  
  _(on [http://localhost:5173](http://localhost:5173) if not in use)_

  ```sh
  npm run dev
  ```

- Build app (for production)

  ```sh
  npm run build
  ```

- Start production server locally

  ```sh
  npm run start
  ```

- Lint source files

  ```sh
  npm run lint
  # to fix errors directly:
  npm run lint:fix
  ```

- Format source files
  ```sh
  npm run format
  ```

## Documentation

With the exception of this Readme, the entire project documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

**Editor tip:**  
Clone the wiki to edit pages locally in your IDE.

```sh
git clone https://github.com/kelzenberg/master-project.wiki.git
```
