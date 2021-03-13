# Transport Exhibit

> This project was completed as part of ARTG 3250 Physical Computing, a class at Northeastern University.

An exhibit about balance and choices when it comes to transportation.

## 🪜 Setup

1. If you haven't already, make sure the following items are installed and up-to-date:

   - [Homebrew](https://brew.sh/)
   - [Node.js](https://nodejs.org)
   - [NVM](https://github.com/nvm-sh/nvm)
   - [Yarn](https://classic.yarnpkg.com/lang/en/)

2. Clone this repository and install dependencies:

   ```sh
   nvm use
   yarn
   ```

3. Run the `develop` command to start the development server!

   ```sh
   yarn develop
   ```

## 🏢 Repo structure

This repository takes the following structure:

```
|- board/
|  |- board.ino          # Arduino sketch
|
|- public/               # static files for the app
|  |- img/               # static images
|  |- index.html         # the root HTML file
|
|- src/                  # web app source code
|  |- components/        # resuable components
|  |- hooks/             # reusable hooks
|  |- providers/         # global or reusable context providers
|  |- App.tsx            # app root
|  |- index.tsx          # mount root (entry file)
|
|- .nvmrc                # NVM config file
|- package.json          # project config
|- tailwind.config.js    # Tailwind CSS config
|- tsconfig.json         # TypeScript config
|- tsconfig.paths.json   # TypeScript paths config (required for CRA)
|- README.md             # documentation (this file!)
```
