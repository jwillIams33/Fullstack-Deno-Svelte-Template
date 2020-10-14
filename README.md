# Svelte + Deno Fullstack App

A super basic CRUD app. Can serve as a starting point for more complex projects.

The frontend is built with Svelte 3 and is based on this tutorial: https://freshman.tech/svelte-todo/

The backend is built against Deno v1.4.5 and is using Oak v6.3.1 as its middleware library.

## Prerequisites

You must have Node.js and npm installed on your machine. This project was built against the following versions:

- Node v12.6.0
- npm v6.9.0 

## Setup

### Installation
- Install Deno https://deno.land/#installation
- Install Denon https://deno.land/x/denon@2.4.4
- Clone this repo to your machine

### Setting up a MongoDB cluster
- create an account at https://www.mongodb.com/
- navigate to Security > Database Access and create a user
- Save your user name and password in the `db_config.ts` file inside the `Backend` folder
- Under Security > Network Access add your current IP Address

### Run the Svelte App:
- `cd` into the project folder and run `npm install`
- Run `npm run dev`
- Navigate to http://localhost:5000

### To start the backend server:
- `cd` into the Backend folder and run `denon run --allow-net --allow-env --allow-read --unstable --allow-plugin --allow-write  server.ts`
- Server will be listening on port 4000. If you're using Postman, navigate to http://localhost:4000/API/tasks/ 

## Useful Guides
- Deno: https://deno.land/
- Denon: https://deno.land/x/denon@2.4.4
- Oak framework: https://oakserver.github.io/oak/
- Deno_Mongo: https://deno.land/x/mongo@v0.12.1
- MongoDB: https://docs.mongodb.com/manual/ 
