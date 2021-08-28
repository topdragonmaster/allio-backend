## Use Correct Node Version

[Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if not yet installed

```sh
$ nvm use || nvm install
```

## Running the app in development mode

```sh
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev
```

## Test

```sh
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Api Document

- Use interactive api document at http://localhost:3000/docs to test the api endpoints

## Database Migration

[Migration](./migration.md)
