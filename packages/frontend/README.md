# @master-project/frontend

---

Simulation visualization layer for the web browser

---

## First step

Check the [global README](https://github.com/kelzenberg/master-project/blob/main/README.md) for requirements and usage.

## Usage

- Start development server in watch mode _(on [http://localhost:3080](http://localhost:3080))_  
  <small>This only serves the HTML files but does not connect via the WebSockets to load essential simulation data.</small>

  ```sh
  npm run F dev
  ```

- Build app (for production)

  ```sh
  npm run F build
  ```

## Notes

The first time you open the Frontend in the browser (running the project locally or via Docker), you will be asked to authorize yourself through [Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). **The credentials to sign in are listed in the [`.env.dist` file](https://github.com/kelzenberg/master-project/blob/main/.env.dist#L19-L22).**

Based on your choice of credentials, you will be assigned the role of `Moderator` (full permissions) or `Student` (restricted permissions).
