# Scrapbook

Scrapbook helps you **share the things you're working on every day!** As a [Hack Clubber](https://hackclub.com/), you are always learning and building things. Scrapbook allows you to share updates on the things you're doing with the rest of the Hack Club community, and keeps you motivated by recording each day you contribute, tallying that up onto a streak shown on your profile.

## How to Set Up the Project

1. **Clone the repository:**
```sh
   git clone https://github.com/hackclub/scrapbook.git
   cd scrapbook
```

2. **Install dependencies:**
```shell
yarn deps-install
```
3. **Request the .env file:** 
Send a message mentioning @creds in Hack Club's Slack asking for the .env file.

4. **Start the development server:**
```shell
yarn dev
```

5. View your server: Open your browser and navigate to http://localhost:3000/.

## Build Commands
### Build the web application:
```sh
yarn build:web
```

### Check code formatting:
```sh
yarn checkFormat 
```

### Format code for Slack bot
```sh
yarn prettier:slack-bot 
```

### Format code for web app
```sh
yarn prettier:web
```



