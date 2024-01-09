FROM node:20

WORKDIR /usr/src/quiz-backend

COPY . .

RUN npm i

COPY . .

EXPOSE 3005

CMD [ "node", "index.js" ]