# Spanboon API
## Social Civic Platform
[![Spanboon](https://spanboon.com/assets/img/logo/logo.svg)](https://github.com/kaogeek/spanboon)

## **Getting Started**
#### Prerequisites
- Download and ***install npm*** from [Node.js](https://nodejs.org/en/download)
- Install MongoDB Community Edition
  - Please read [installation steps](https://docs.mongodb.com/manual/installation) carefully.

### Steps to run Spanboon API

1. Run `npm install` command
2. Create `.env` file
3. Setup Enviromnent settings inside `.env` file
    #### Database Config
    - TYPEORM_HOST=`hostName`
    - TYPEORM_PORT=`port`
    - TYPEORM_DATABASE=`dbName`
    - TYPEORM_URL=`mongodb://hostName:port/dbName`
    ***If your MongoDB Has Username and Password you ***
    - TYPEORM_URL=`mongodb://dbUserName:dbPassword@hostName/dbName`
    - TYPEORM_USERNAME=`dbUserName`
    - TYPEORM_PASSWORD=`dbPassword`
    #### Email Config
    - MAIL_USERNAME=`yourEmail`
    - MAIL_PASSWORD=`yourEmailPassword`
    - MAIL_FROM=`yourEmail`
    #### Social Config
    - **Facebook**
        - FACEBOOK_APP_ID=`FACEBOOK_APP_ID`
        - FACEBOOK_APP_SECRET=`FACEBOOK_APP_SECRET`
    - **Google**
        - GOOGLE_CLIENT_ID=`GOOGLE_CLIENT_ID`
        - GOOGLE_CLIENT_SECRET=`GOOGLE_CLIENT_SECRET`
        - GOOGLE_REDIRECT_URL=`GOOGLE_REDIRECT_URL`
        - GOOGLE_SCOPES=`GOOGLE_SCOPES`
    - **Twitter**
        - TWITTER_API_KEY=`TWITTER_API_KEY`
        - TWITER_API_SECRET_KEY=`TWITER_API_SECRET_KEY`
        - TWITTER_BEARER_TOKEN=`TWITTER_BEARER_TOKEN`
        - TWITTER_ACCESS_TOKEN=`TWITTER_ACCESS_TOKEN`
        - TWITTER_TOKEN_SECRET=`TWITTER_TOKEN_SECRET`
4. Run `npm start serv` command to start Spanboon API

### Feature Requests and Bug Reports
When you file a feature request or when you are submitting a bug report to the [issue tracker](https://github.com/kaogeek/spanboon/issues), make sure you add steps to reproduce it. Especially if that bug is some weird/rare one.

## License
This project is currently licensed under the [MIT License](https://github.com/kaogeek/spanboon/blob/main/LICENSE).



