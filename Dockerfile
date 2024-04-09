FROM node:18.20-alpine

RUN apk --update add \
   	tzdata \
   && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
   && apk del tzdata
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