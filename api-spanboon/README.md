# Spanboon API

### Steps to run this project:

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
4. Run `npm start serv` command to start API

