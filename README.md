# **Spanboon Project**
## Social Civic Platform
[![Spanboon](https://spanboon.com/assets/img/logo/logo.svg)](https://github.com/kaogeek/spanboon)

### What's included
+ [Spanboon API](https://github.com/kaogeek/spanboon/tree/main/api-spanboon)
+ [Spanboon Web](https://github.com/kaogeek/spanboon/tree/main/web-spanboon) 
+ [Spanboon Admin](https://github.com/kaogeek/spanboon/tree/main/admin-spanboon)

## **Getting Started**
#### Prerequisites
- Install MongoDB Community Edition
  - Please read [installation steps](https://docs.mongodb.com/manual/installation) carefully.
- Download and ***install npm*** from [Node.js](https://nodejs.org/en/download)
- Download and ***install git*** tool you prefer, eg.
  - [Sourcetree](https://www.sourcetreeapp.com)
  - [Github Desktop](https://desktop.github.com)
  - ***Clone***, or ***Check out***, this repository to your local `<INSTALL_DIR>` by following [these steps](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository).
- **Navigate to `<INSTALL_DIR>`** by using ***Cmd*** *(in Windows)* or ***Terminal*** *(in MacOS)*.
- **Install dependency packages** by executing:
  ```
    npm install
  ```

#### Running Spanboon API Server
- You can run the Spanboon API server by executing:
  ```
    npm start serve
  ```
  
#### Running Spanboon Web and Admin
- You can run the Spanboon Web and Admin by executing:
  ```
    npm run start
  ```

### Building Spanboon API
- `npm start build` (development)
- `npm start build production` (production)

### Building Spanboon Web and Admin
- `npm run build` (development)
- `npm run prod` (production)

### Feature Requests and Bug Reports
When you file a feature request or when you are submitting a bug report to the [issue tracker](https://github.com/kaogeek/spanboon/issues), make sure you add steps to reproduce it. Especially if that bug is some weird/rare one.

## License
This project is currently licensed under the [MIT License](https://github.com/kaogeek/spanboon/blob/main/LICENSE).
