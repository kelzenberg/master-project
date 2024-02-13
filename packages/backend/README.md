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

## Notes

The backend requires a small SQLite database whose file is added and committed to this repo and can be found at `./src/database.db`.

The database keeps track of which simulation server in the environment (e.g. production cluster) got which UUID assigned from the Backend server; in order to persist generated URLs on Backend server restarts or deployments. This basically enables that a user can save or share a link to a simulation and the link will forever lead to the same simulation, until the simulation gets removed from the environment.
