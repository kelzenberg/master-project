# Master Project

<small>Software project for the academic course "Master Project WiSe23/24" at the [Berliner Hochschule für Technik](https://bht-berlin.de/en),  
in cooperation with the [Fritz-Haber-Institut](https://www.fhi.mpg.de/en) of the [Max-Planck-Gesellschaft](https://www.mpg.de/en).</small>

---

## Prerequisites

> **Before you start...**  
> Everything you need to successfully run and develop this project is described in this README **and** the READMEs inside the `./packages/**` folders.

### Requirements

- [Git](https://git-scm.com/)
  - We enforce a line ending of `LF`.
    More details [here](https://www.aleksandrhovhannisyan.com/blog/crlf-vs-lf-normalizing-line-endings-in-git/).
- [NodeJS](https://nodejs.org/en) version `^21.1.x`
  - Including [NPM](https://www.npmjs.com/package/npm) version `^10.2.x`
  - [Optional] [nvm](https://github.com/nvm-sh/nvm) to switch Node versions, see `.nvmrc`
- [Docker Desktop](https://docs.docker.com/desktop/) or similar container virtualization software

### Recommendations

- Create your local `.env` file copy ([info](https://nodejs.org/docs/latest-v21.x/api/cli.html#--env-fileconfig)) with
  ```sh
  # MacOS/Linux
  cp ./.env.dist ./.env
  # Windows
  copy .\.env.dist .\.env
  ```
- Compare your local NodeJS version via `node -v` with the [required version](#requirements).
- Run `npm install` _once_ to install all dependencies.

#### Editor: [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/)

- Plus [ESLint Extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint/), [Prettier Extension](https://open-vsx.org/vscode/item?itemName=esbenp.prettier-vscode), [EditorConfig Extension](https://open-vsx.org/vscode/item?itemName=EditorConfig.EditorConfig), [DotENV](https://open-vsx.org/vscode/item?itemName=mikestead.dotenv).
- Settings that make your life easier:

  ```jsonc
  // Add this to user settings to auto-lint on Save
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
  ],
  // Use unix end of line character
  "files.eol": "lf"
  ```

## Branches & Hooks

> The repository consistently holds two branches, `main` and `dev`.  
> Other branches are focused, purpose-driven and short-lived.  
> We do run some code via Git hooks before you can commit on any branch though.

### [`main` Branch](https://github.com/kelzenberg/master-project/tree/main)

**Considered as the "release" branch**  
From here, every commit will undergo our continuous integration steps and ultimately be continuously deployed into the FHI production system. Commits on this branch need to be approved via Pull Request by minimum one other team member and the branch keeps a linear Git history.

### [`dev` Branch](https://github.com/kelzenberg/master-project/tree/dev)

**Considered as the "newest features/fixes" branch**  
This is a fast-paced branch for internal development, so expect a lot of changes while you are working on it. Holds the latest additions to the code base and will be squash-/rebase-merged into `main` on a team-decision base.

### Other Branches

**Any other branch should be purpose-driven and short-lived.**  
They will be merged/rebased into `dev` and deleted when done. Ideally each additional branch mentions/resolves a specific issues or milestone in the [Project board](https://github.com/users/kelzenberg/projects/2/views/1). Feel free to request Pull Requests reviews when merging/rebasing to `dev` but it is optional.

### Hooks

This repository uses pre-commit Git hooks via [husky](https://www.npmjs.com/package/husky) and [lint-staged](https://www.npmjs.com/package/lint-staged) to check your commit for faulty code formatting and linter errors. You do not need to install anything extra (but you should, see [Recommendations](#recommendations)) to make this work.  
During the `git commit` action you will see the hooks running in your console.

**⚠️ If the hooks fail, you should fix your changes before committing again ⚠️**

## Monorepo & Packages

> This project is **split into several packages** (see `./packages` folder), each of which fulfills a part of the software's intended purpose. They stand on its own as complete software but their content can be imported/used across the whole repository.  
> In doing so this repository becomes a [monorepo](https://monorepo.tools).

### Packages

---

#### [@master-project/frontend](https://github.com/kelzenberg/master-project/tree/main/packages/frontend)

**Simulation visualization layer for the web browser**

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/frontend/README.md)
- Short: `npm run F ...`
- **Usage: `npm run F [dev|build|start]`**
- Install dependencies: `npm run install:F {NPM-package-name}`
- Remove dependencies: `npm run remove:F {NPM-package-name}`

#### [@master-project/backend](https://github.com/kelzenberg/master-project/tree/main/packages/backend)

**Backend server to manage the communication** between simulation and frontend

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/backend/README.md)
- Short: `npm run B ...`
- **Usage: `npm run B [dev|start]`**
- Install dependencies: `npm run install:B {NPM-package-name}`
- Remove dependencies: `npm run remove:B {NPM-package-name}`

#### [@master-project/libs](https://github.com/kelzenberg/master-project/tree/main/packages/libs)

**Shared modules and data**

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/libs/README.md)
- Short: `npm run L ...`
- **Usage: `None` (import to other packages only)**
- Install dependencies: `npm run install:L {NPM-package-name}`
- Remove dependencies: `npm run remove:L {NPM-package-name}`

---

#### Notes on Packages

- ⚠️ Package-related NPM dependencies are installed **only for the respective workspace** ⚠️  
  _Example_ `ThreeJS` is installed only for workspace `@master-project/frontend`.
- Generic configuration files are located on the root level of the repository  
  They are valid for all packages but can be overwritten by local configuration files.  
  _Example_ `./eslintrc.json`
- Each package has their own local configuration files.  
  _Example_ `./packages/frontend/eslintrc.json`

### Package Containerization

This repository offers package containerization via [Docker](https://docs.docker.com).

- Build and run container images locally

  ```sh
  npm run up
  ```

- Stop locally running container images

  ```sh
  npm run down
  ```

- Recreate local images forcibly (optional)

  ```sh
  docker compose up --force-recreate --build --remove-orphans
  ```

### Global Commands

These NPM commands will be executed for ALL packages.

- Reset installed dependencies and build artifacts

  ```sh
  npm run reset
  ```

- Remove build artifacts

  ```sh
  npm run clean
  ```

- Lint source files (with ESLint)

  ```sh
  npm run lint # lint only and show errors
  npm run lint:fix # lint and fix errors
  ```

- Format source files (with Prettier)
  ```sh
  npm run format
  ```

#### Notes on Global Commands

You can run any NPM command consecutively for all packages by adding a `--workspaces` to it.  
For example, `npm run --workspaces @master-project/frontend threejs` will install `ThressJS` only for the frontend package.

## Project Documentation

With the exception of this README and the package's READMEs, the entire project documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

### Hint for Editors

Clone the Wiki to edit pages locally in your editor.

```sh
git clone git@github.com:kelzenberg/master-project.wiki.git
```
