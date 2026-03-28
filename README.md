# Interviewer
Interview application for employers, organizations, and small groups.


### Install Steps

**DISCLAMER:** Please install NodeJS if you have not already... to do so you can find the file here [Install Node](./INSTALLNODE.md)

### Step 1: 

Open your terminal either in VS Code or where you can the /interviewer directory. 

In the root of the application run...

`npm install`


## Database Setup

Before running the application you need MySQL installed and a database created.

### Step 1: Install MySQL

```bash
brew install mysql
```

### Step 2: Start the MySQL service

```bash
brew services start mysql
```

Verify it is running:

```bash
brew services list | grep mysql
```

You should see `mysql` with a status of `started`.

### Step 3: Create the database

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS interviewer;"
```

### Step 4: Configure environment variables

Copy the example env file and fill in your values:

```bash
cp env.example .env
```

Your `.env` should look like this (adjust if your MySQL user or password differs):

```
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=interviewer
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change-me-in-production
```

### Step 5: Seed a full dev environment

Run:

```bash
npm run setup:dev
```

That command rebuilds the schema and seeds:

- 1 organization
- interviewer and interviewee accounts
- 3 interview questions with test cases
- 3 sample interview sessions

Seeded credentials:

- `interviewer@acme.dev` / `Password123!`
- `candidate@acme.dev` / `Password123!`

Sample join codes:

- `DEV12345`
- `PAIR6789`
- `HIRED001`

---

## Steps to Run the Interviewer application


### Step 1:

`npm run dev`
