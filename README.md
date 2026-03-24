# Interviewer
Interview application for employers, organizations, and small groups.


### Install Steps

**DISCLAMER:** Please install NodeJS if you have not already... to do so you can find the file here [Install Node](./INSTALLNODE.md)

### Step 1: 

Open your terminal either in VS Code or where you can the /interviewer directory. 

In the root of the application run...

`npm install`


## Database Setup

Before running the application you need PostgreSQL installed and a database created.

### Step 1: Install PostgreSQL

```bash
brew install postgresql@14
```

### Step 2: Start the PostgreSQL service

```bash
brew services start postgresql@14
```

Verify it is running:

```bash
brew services list | grep postgres
```

You should see `postgresql@14` with a status of `started`.

### Step 3: Create the database

```bash
createdb interviewer
```

If you get a "role does not exist" error, create your user first:

```bash
createuser -s $(whoami)
createdb interviewer
```

### Step 4: Configure environment variables

Copy the example env file and fill in your values:

```bash
cp env.example .env
```

Your `.env` should look like this (adjust if your Postgres user or password differs):

```
DB_NAME=interviewer
DB_USER=<your-db-username>
DB_PASSWORD=
DB_HOST=localhost
JWT_SECRET=change-me-in-production
```

> **Note:** The database tables are created automatically when the backend starts for the first time via Sequelize's `sync()`.

---

## Steps to Run the Interviewer application


### Step 1:

`npm run dev`