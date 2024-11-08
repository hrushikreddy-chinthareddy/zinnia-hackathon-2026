FROM cypress/base

WORKDIR /tests

COPY ./package.json .
COPY ./tsconfig.json .
COPY ./cypress.config.ts .
COPY ./cypress ./cypress

RUN npm install

ENTRYPOINT ["npx","cypress", "run", "-c" ,"baseUrl=https://qa.open.zinnia.com"]