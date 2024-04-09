FROM node:18.20-alpine

RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "run", "start" ]