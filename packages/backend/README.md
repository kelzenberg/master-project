# @master-project/backend

---

Backend server to manage the communication between simulation and frontend

---

## First step

Check the [global README](https://github.com/kelzenberg/master-project/blob/main/README.md) for requirements and usage.

## Usage

- Start development server in watch mode _(on [http://localhost:3000](http://localhost:3000))_

  ```sh
  npm run B dev
  ```

- Start production server locally _(on [http://localhost:3000](http://localhost:3000))_

  ```sh
  npm run B start
  ```

- Generate local certificates for HTTPS  
  <small>Set environment variable `USE_HTTPS` to `true` to enable HTTPS on the local server</small>

  ```sh
  npm run B generate-cert
  ```
