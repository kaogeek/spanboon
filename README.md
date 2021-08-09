# Spanboon Project
+ <a href="https://www.spanboon.com" target="_blank">Live Demo</a>

### What's included
+ [Spanboon API](https://github.com/kaogeek/spanboon/tree/main/api-spanboon)
+ [Spanboon Web](https://github.com/kaogeek/spanboon/tree/main/web-spanboon) 
+ [Spanboon Admin](https://github.com/kaogeek/spanboon/tree/main/admin-spanboon)

# Spanboon Project
![Social Civic Platform](docs/images/Frontend_Branding.png)

[![Build Status](https://github.com/fossasia/open-event-frontend/workflows/CI/badge.svg?branch=development)](https://github.com/fossasia/open-event-frontend/actions?query=workflow%3Aci)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7933f260d39f462ea809b3583eb81ae1)](https://www.codacy.com/gh/kaogeek/spanboon/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=kaogeek/spanboon&amp;utm_campaign=Badge_Grade)
[![Mailing](https://img.shields.io/badge/Mailing-List-red.svg)](https://groups.google.com/g/spanboon)

## Communication
- Please join our [Mailing list](https://groups.google.com/g/spanboon)

## Install MongoDB Community Edition
- Please read [installation steps](https://docs.mongodb.com/manual/installation) carefully.

## Restore Master Data
 - After installation mongoDB you can restoration master data
    `mongorestore --gzip --archive=masterdata.gz --nsInclude="<yourDBName>.*"`

## Running / Development
**Note**: Please follow [installation steps](/docs/installation/local.md#steps) listed above carefully before running 

Unfortunately, no one reads the note above, so please just run the following commands when setting up for the first time:
- `npm install`

Running:
- `npm run start`
- Visit your app at [http://localhost:4200](http://localhost:4200).

### Building
- `npm run build` (development)
- `npm run build --prod` (production)

### Customize Website
- Open `variable.scss`
- Find variable `$brandcolor2` and change value to your theme color
- And you can change variable start with `$color` 

### Feature Requests and Bug Reports
When you file a feature request or when you are submitting a bug report to the [issue tracker](https://github.com/kaogeek/spanboon/issues), make sure you add steps to reproduce it. Especially if that bug is some weird/rare one.

### Join the development
- Before you join development, please set up the project on your local machine, run it and go through the application completely. Press on any button you can find and see where it leads to. Explore. (Don't worry ... Nothing will happen to the app or to you due to the exploring. Only thing that will happen is, you'll be more familiar with what is where and might even get some cool ideas on how to improve various aspects of the app.)
- If you would like to work on an issue, drop in a comment at the issue. If it is already assigned to someone, but there is no sign of any work being done, please feel free to drop in a comment so that the issue can be assigned to you if the previous assignee has dropped it entirely.

## License
This project is currently licensed under the [MIT License](LICENSE).
