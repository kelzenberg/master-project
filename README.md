# Interactive Web-Frontend for Server-based Scientific Simulations

<small>Software project for the academic course "Master Project WiSe23/24" at the [Berliner Hochschule für Technik](https://bht-berlin.de/en) (BHT), in cooperation with the [Fritz-Haber-Institute](https://www.fhi.mpg.de/en) (FHI) of the [Max-Planck-Gesellschaft](https://www.mpg.de/en).</small>

## <small>Project Outline</small>

> <small>The Theory Department of the Fritz-Haber-Institute has developed several interactive simulation models for use in teaching and outreach acitivities (e.g. Girl's Day, Long Night of the Sciences) in the past. The legacy GUIs of the simulation apps were programmed using traditional GUI toolkits and OpenGL canvases, that require a high amount of regular maintenance. Additionally, the software requirements (libraries, toolkits, OS, ...) on the computers used for outreach activities are complex, limiting these to pre-configured hardware that needs to be available for every event. This, in turn, renders online or hybrid courses with remote participants on their own devices almost impossible. <br>The goal of the proposed project is to modernize the UI component making use of a browser based client-server architecture. The open-source server components are being developed at the FHI in python/C++ and can be adapted to suit the new UI model. The envisioned UI component should be a simple to maintain modular framework consisting of a WebGL canvas for a model view along with multiple control widgets and state-of-the-art JavaScript/SVG (e.g. D3.js, Chart.js, or similar) based dynamically updated display elements for scientific observables, e.g. temperatures or pressures, as they occur in the server-side simulations.</small>

---

## Prerequisites

> **Before you start...**  
> Everything you need to successfully run and develop this project is described in this README **and** the READMEs inside the `./packages/**` folders. Please also see the FAQ section below.

### Requirements

#### Software

- Some form of UNIX-based shell like bash; especially on Windows, use [WSL](https://code.visualstudio.com/docs/remote/wsl)
- [Git](https://git-scm.com/)
  - We enforce a line ending of `LF`.
    More details [here](https://www.aleksandrhovhannisyan.com/blog/crlf-vs-lf-normalizing-line-endings-in-git/).
- [NodeJS](https://nodejs.org/en) version `^21.1.x`
  - Including [NPM](https://www.npmjs.com/package/npm) version `^10.2.x`
  - [Optional] [nvm](https://github.com/nvm-sh/nvm) to switch Node versions, see `.nvmrc`
- [Docker Desktop](https://docs.docker.com/desktop/) or similar container virtualization software

#### Actions

- Create your local `.env` file copy ([info](https://nodejs.org/docs/latest-v21.x/api/cli.html#--env-fileconfig)) with
  ```sh
  # Linux/MacOS
  cp ./.env.dist ./.env
  # Windows
  copy .\.env.dist .\.env
  ```
  > Required. Descriptions of what the effects of individual environment values are can be found inside the `.env.dist` file as comments. Comes with pre-configured values already in place.
- Compare your local NodeJS version via `node -v` with the [required version](#requirements) above.
- Run `npm install` _once_ to install all dependencies.

### Recommendations

#### Editor: [VSCodium](https://vscodium.com/) or [VSCode](https://code.visualstudio.com/)

- Plus [ESLint Extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint/), [Prettier Extension](https://open-vsx.org/vscode/item?itemName=esbenp.prettier-vscode), [EditorConfig Extension](https://open-vsx.org/vscode/item?itemName=EditorConfig.EditorConfig), [DotENV](https://open-vsx.org/vscode/item?itemName=mikestead.dotenv).
- Settings in VSC which make your dev life easier:

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
> We do run some code via Git hooks before you can commit on any branch to check and maintain code standards and quality.

### [`main` Branch](https://github.com/kelzenberg/master-project/tree/main)

**Considered as the "release" branch**  
From here, every commit will ultimately be deployed into the FHI production systems. Commits on this branch need to be approved via Pull Request by a minimum of one other team member. The branch requires a linear Git history.

### [`dev` Branch](https://github.com/kelzenberg/master-project/tree/dev)

**Considered as the "newest features/fixes" branch**  
This is a fast-paced branch for internal development, so expect a lot of changes while you are working on it. Holds the latest additions to the code base and will be squash-/rebase-merged into `main` on a team-decision base.

### Other Branches

**Any other branch should be purpose-driven and short-lived.**  
They will be merged/rebased into `dev` and deleted when done. Ideally each additional branch mentions/resolves a specific issues or milestone in the [Project board](https://github.com/users/kelzenberg/projects/2/views/1). Feel free to request Pull Requests reviews when merging/rebasing to `dev` but it is optional.

### Hooks

This repository uses pre-commit Git hooks via [husky](https://www.npmjs.com/package/husky) and [lint-staged](https://www.npmjs.com/package/lint-staged) to check your commit for faulty code formatting and linter errors. You do not need to install anything extra (but you should see the [Recommendations](#recommendations) section) to make this work.  
During the `git commit` action you will see the hooks running in your console.

**⚠️ If the hooks fail, you should fix your changes accordingly before committing again ⚠️**

## Monorepo & Packages

> This project is **split into several packages** (see `./packages` folder), each of which fulfills a part of the software's intended purpose. They stand on its own as complete software but their content can be imported/used across the whole repository.  
> In doing so this repository becomes a [monorepo](https://monorepo.tools).

### Packages

---

#### [@master-project/frontend](https://github.com/kelzenberg/master-project/tree/main/packages/frontend)

**Simulation visualization layer for the web browser**

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/frontend/README.md)
- Short: `npm run F ...`
- **Usage: `npm run F [dev|build]`**
- Install dependencies: `npm run install:F {NPM-package-name}`
- Remove dependencies: `npm run remove:F {NPM-package-name}`
- Test: `npm run test:F`

##### Roles & Permissions

The first time you open the Frontend in the browser (running the project locally or via Docker), you will be asked to authorize yourself through [Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). **The credentials to sign in are listed in the [`.env.dist` file](https://github.com/kelzenberg/master-project/blob/main/.env.dist#L19-L22).**

Based on your choice of credentials, you will be assigned the role of `Moderator` (full permissions) or `Student` (restricted permissions).

#### [@master-project/backend](https://github.com/kelzenberg/master-project/tree/main/packages/backend)

**Backend server to manage the communication** between simulation and frontend

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/backend/README.md)
- Short: `npm run B ...`
- **Usage: `npm run B [dev|start|generate-cert]`**
- Install dependencies: `npm run install:B {NPM-package-name}`
- Remove dependencies: `npm run remove:B {NPM-package-name}`

#### [@master-project/libs](https://github.com/kelzenberg/master-project/tree/main/packages/libs)

**Shared modules and data**

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/libs/README.md)
- Short: `npm run L ...`
- **Usage: `None` (import to other modules only)**
- Install dependencies: `npm run install:L {NPM-package-name}`
- Remove dependencies: `npm run remove:L {NPM-package-name}`

#### [@master-project/simulation](https://github.com/kelzenberg/master-project/tree/main/packages/simulation)

**Python simulation wrapped in a HTTP server**

- [Readme](https://github.com/kelzenberg/master-project/tree/main/packages/simulation/README.md)
- Short: `npm run S ...`
- **Usage: `npm run S [dev]`**
- For more information, please see the project documentation from FHI.

---

#### Notes on Packages

- ⚠️ Package-related NPM dependencies are installed **only for the respective workspace** ⚠️  
  _Example_ `ThreeJS` is installed in the workspace `@master-project/frontend` only.
- Generic configuration files are located on the root level of the repository  
  They are valid for all packages but can be overwritten by local configuration files.  
  _Example_ `./eslintrc.json`
- Each package has their own local configuration files, extending or overwriting the root files.  
  _Example_ `./packages/frontend/eslintrc.json`

### Package Containerization

This repository offers package containerization via [Docker](https://docs.docker.com) to simplify cross-system development and previewing built artifacts in production systems.

Make sure, all environment variables have values set in the `.env` file before running the commands below.

> This is the easiest way to run the project quickly in its entirety.

- Build and run container images locally

  ```sh
  npm run up
  ```

- Stop locally running containers

  ```sh
  npm run down
  ```

- Recreate local container images forcibly (optional, resetting)

  ```sh
  npm run docker:reset
  ```

- Verbose console output of local container recreation (optional, debugging)

  ```sh
  npm run docker:verbose
  ```

### Further Global Commands

These NPM commands will be executed for ALL packages.

- Remove build artifacts

  ```sh
  npm run clean
  ```

- Cleanly re-install the whole project & its dependencies locally

  ```sh
  npm run reset
  ```

- Lint source files (with ESLint)

  ```sh
  npm run lint # lint only and show errors
  npm run lint:fix # lint and fix errors automatically
  ```

- Format source files (with Prettier)
  ```sh
  npm run format # run formatter but only show errors
  npm run format:fix # format and fix errors automatically
  ```

#### Notes on Global NPM Commands

You can run any NPM command consecutively for all packages by adding a `--workspaces` to it.  
For example, `npm install --workspaces @master-project/frontend threejs` will install `ThressJS` only in the frontend package.

## Project Documentation

With the exception of this README and the package's READMEs, more of the project's documentation can be found [in the wiki](https://github.com/kelzenberg/master-project/wiki).

### Hint for Wiki Editors

Clone the Wiki to edit pages locally in your editor.

```sh
git clone git@github.com:kelzenberg/master-project.wiki.git
```

## FAQ

### Q: Why is Docker complaining about missing environment variables on build/start?

- **A:** Please check if your local `.env` file lists **all** values that are present in the `.env.dist` file.

### Q: How can I develop the Frontend or Backend with actual data from the Python simulation?

- **A:**
  - Start the Python simulation and HTTP server package in Docker (e.g. `npm run up`, stop the `app` container but keep the `sim` container running),
  - then build the Frontend package with `npm run F build`,
  - then start the development server of the Backend package with `npm run B dev`.  
    It will serve the build files of the `dist` folder in the Frontend package.
  - You will need to rebuild the Frontend package to see Frontend code changes. The Backend server will serve the edited files automatically without a restart.

### Q: How can I adjust the speed in which the Backend worker will request and distribute new Python simulation updates?

- **A:** Via the environment variable `WORKER_DELAY` in either your `.env` file if you are developing locally or within the environment you are exposing in your production system to the Backend server. The value is an integer describing milliseconds, e.g. `2000` creates a two second delay between simulation update requests.

### Q: Everything is broken, what should I do now[?](https://knowyourmeme.com/memes/this-is-fine)

- **A:** Read the error messages. To get back to the initially cloned state, run
  ```
  cp ./.env.dist ./.env && npm install && npm run reset && npm run docker:reset
  ```
