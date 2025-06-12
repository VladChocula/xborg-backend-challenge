# XBorg Tech Challenge

## Submission Requirements

- Unit Tests
- Integration Tests
- E2E Testing
- Testing Performance benchmarks
- Clearly document strategies via effective testing and in the Submission Documentation section of the ReadMe

Implementation should be submitted via a public GitHub repository, or a private repository with collaborator access granted to the provided emails.

## Architecture

- Language - Typescript
- Monorepo - Turborepo
- Client - NextJs
- Api - NestJs
- DB - SQLite

## Apps and Packages

- `client`: [Next.js](https://nextjs.org/) app
- `api`: [Nestjs](https://nestjs.com) app
- `tsconfig`: Typescript configuration used throughout the monorepo

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/) for Git hooks

## Steps to run app

#### Install Metamask [link](https://chromewebstore.google.com/detail/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=item-share-cb)

#### Run commands in order

```bash
# Enter all commands from the project root

# Start the infrastructure (Requires Docker)
$ yarn start:local:infra

# Install dependencies
$ yarn install

 # Build the app including the lib
$ yarn build

# Migrate the DB
$ cd apps/api && yarn migrate:local

 # Run the application stack in dev
 $ yarn dev
```

## Additional Commands

```bash
# Run tests in all apps
$ yarn test

# Run linter in all apps
$ yarn lint

# Format code in all apps
$ yarn format

```

## Submission Documentation...

> Thank you all for the opportunity to test my backend automation skills against this app. It was a wonderful task that I thoroughly enjoyed completing to the best of my abilities. I am writing this towards the end of working on this challenge, so apologies if I miss some key details in my development process. I'm going to write out exactly how I reached the decisions I decided to go with to the best of my ability.

> For starters, when I first opened up the directory in visual studio code, my first instinct was to open up this very ReadMe, to see what documentation I had available to me. I decided to go along and debug any errors I found as I made my way towards starting the infrastructure locally in a Docker container on my own machine, migrating the DB locally, and running the application in dev mode. I wasn't sure what environment this was originally propped up in, so I had to make sure I could at least build this app on my Windows 10 machine without any major issues.

> Once it was done and I had the container running successfully, I installed some dependencies on the root directory that I thought I might need in order to automate some tests. Given the TS requirement and some of the other configurations already present on the repository, I felt using a combination of Jest, Playwright for any front-end automation I may need, and then possibly Artillery for some performance testing needs, would be a solid foundation to begin this challenge from. Once that was all done, it finally dawned on me - I had no idea what services were here, how they were architected or structured, or where to begin tackling each individual piece from a testing standpoint.

> I spent the next few hour pouring over the api, client, and gateway sub-directories to get a full understanding of what exactly would need to be tested here. I quickly came to the realization that automation test frameworks had already come pre-packaged in the individual apps inside of the monorepo. The scaffolding that was setup in the **test** folder gave great insight into how I was being asked to approach the unit and integration tests of the api app, and the e2e scaffolding in the gateway app showed me where e2e testing could be approached from.

> Given what I was seeing, I decided to approach testing the repository/controller/service portion of the user api, in a style similar to what I was seeing in the user.repository.spec jest tests. I decided to split off actual integration tests, specifically integrations for the service or controller, away from using mocked responses from the UserRepository or UserService that I was doing in the unit tests. I did review the test cases covered in user.repository.spec and decided to add a case I felt was missing coverage.

> Once I was done there, I moved over into the gateway folder. I noted that many of the testable elements I was seeing in the client folder had more to do with the front-end of the application, and this challenge seemed tailored towards back-end application automation testing. The first things I opted to do was to get a full understanding on which http paths had been setup in any controller files found in the gateway director. After noting the paths and what type of http calls they had been setup to receive, I set about building out end-to-end tests for both the user.controller and siwe.controller.

> Due to the nature of how this app was setup to be run as a challenge, I decided to merely mock the app's full service stack instead of having the app run locally on my machine, and then hitting those endpoints that would be found on localhost. I really didn't want to alter the configurations of the challenge repository all that much in order to facilitate true end-to-end test coverage, since I wasn't sure if these tests were going to be run by anyone reviewing it. In order to ensure reviewing this would be more convient, I decided to merely mock out the SiweService and UserClientAPI instead of standing them up, standing up the DB, then verifying these pathes down on the DB layer, which is how I would approach a true end-to-end test in a true development environment, ideally with these tests running on a CI/CD pipeline.

Once it was all done, it was merely a question of ensuring all the tests I would be submitting would pass. I did alter the error codes I was looking for on the end to end side to 500s in cases where I normally expect some form of a 200 or 400 style response, because I had noted that some of the services had not been setup to properly account for some of the test cases I was automating. Apologies if I went a little overboard.
