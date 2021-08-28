## Install Correct Node Version

[Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if not yet installed

```sh
$ nvm use || nvm install
```

## Install pnpm package manager

```sh
npm i -g pnpm
```

## Install npm dependencies

```sh
$ pnpm install
```

## PostgreSQL

- follow [postgresql setup on mac](https://www.sqlshack.com/setting-up-a-postgresql-database-on-mac/) to run the PostgreSQL service.
- go to PostgreSQL cli (replace `user` with the actual username created in the previous step)
  ```sh
  psql postgres -U user
  ```
- create `allio` database
  ```sql
  CREATE DATABASE allio;
  ```
- connect to `allio` database
  ```
  \c allio
  ```
- enable PostgreSQL uuid-ossp module function
  ```sql
  CREATE EXTENSION "uuid-ossp";
  ```

## Environment Variables

- copy the `.env.example` file to `.env` and modify the permission

  ```sh
  cp .env.example .env
  chmod 640 .env
  ```

- modify the `user` and `password` accordinly in the `.env` file

```
MIKRO_ORM_USER = user
MIKRO_ORM_PASSWORD = password
```

## FAQ

- Peer authentication error when logging in psql
  - https://gist.github.com/AtulKsol/4470d377b448e56468baef85af7fd614
