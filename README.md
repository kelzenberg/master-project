# Master Project

<small>Software project for the academic course "Master Project WiSe23/24" at the [Berliner Hochschule für Technik](https://bht-berlin.de/en),  
in cooperation with the [Fritz-Haber-Institut](https://www.fhi.mpg.de/en) of the [Max-Planck-Gesellschaft](https://www.mpg.de/en).</small>

---

## Prerequisites

> **Before you start...**  
> Everything you need to successfully run and develop this project is described in this README _and_ the READMEs inside the `./packages/**` folders.

### Requirements

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en) version `^21.1.x`
  - Including [NPM](https://www.npmjs.com/package/npm) version `^10.2.x`
  - [Optional] [nvm](https://github.com/nvm-sh/nvm) to switch Node versions, see `.nvmrc`

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

#### Editor Recommendation: [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/)

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

## Repository Setup

> The repository consistently holds two branches, `main` and `dev`.  
> Other branches are focused, purpose-driven and short-lived.

### [`main` Branch](https://github.com/kelzenberg/master-project/tree/main)

**Considered as the "release" branch**  
From here, every commit will undergo our continuous integration steps and ultimately be continuously deployed into the FHI production system. Commits on this branch need to be approved via Pull Request by minimum one other team member and the branch keeps a linear Git history.

### [`dev` Branch](https://github.com/kelzenberg/master-project/tree/dev)

**Considered as the "newest features/fixes" branch**  
This is a fast-paced branch for internal development, so expect a lot of changes while you are working on it. Holds the latest additions to the code base and will be squash-/rebase-merged into `main` on a team-decision base.

### Other Branches

**Any other branch should be purpose-driven and short-lived.**  
They will be merged/rebased into `dev` and deleted when done. Ideally each additional branch mentions/resolves a specific issues or milestone in the [Project board](https://github.com/users/kelzenberg/projects/2/views/1). Feel free to request Pull Requests reviews when merging/rebasing to `dev` but it is optional.

### Git Hooks

This repository uses pre-commit Git hooks via [husky](https://www.npmjs.com/package/husky) and [lint-staged](https://www.npmjs.com/package/lint-staged) to check your commit for faulty code formatting and linter errors. You do not need to install anything extra (but you should, see [Recommendations](#recommendations)) to make this work.  
During `git commit` actions you will see the hooks running in your console.  
**If the hooks fail, you should fix your changes before committing again.**

## Monorepo Setup

> This project is **split into several packages**, each of which fulfills a part of the software's intended purpose. They stand on its own as complete software but their content can be imported/used across the whole repository. In doing so this repository becomes a [monorepo](https://monorepo.tools).

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

## Project Documentation

With the exception of this README and the package's READMEs, the entire project documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

**Editor tip:**  
Clone the wiki to edit pages locally in your editor.

```sh
git clone https://github.com/kelzenberg/master-project.wiki.git
```
