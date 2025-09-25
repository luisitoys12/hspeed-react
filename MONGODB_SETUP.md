
# MongoDB Configuration for Habbospeed

This document provides a guide on how to set up and configure MongoDB for the Habbospeed application. In a production environment, you would replace the mock data located in `src/lib/data.ts` with data fetched from a MongoDB database.

## 1. Prerequisites

- A MongoDB account (you can create one for free on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)).
- Node.js and npm installed on your local machine.

## 2. Setting up MongoDB Atlas

1.  **Create a New Project:** After logging into your MongoDB Atlas account, create a new project.
2.  **Build a Database:** Inside your project, click "Build a Database". Choose the free "M0" cluster for development purposes. Select a cloud provider and region that is closest to you.
3.  **Create a User:** Under "Security" -> "Database Access", create a new database user. Give it a username and a strong password. You will need these credentials for your application. Grant the user "Read and write to any database" privileges for now.
4.  **Configure Network Access:** Under "Security" -> "Network Access", add an IP address. For local development, you can add your current IP address. For a deployed application, you will need to add the IP address of your hosting server or `0.0.0.0/0` to allow access from anywhere (use with caution).
5.  **Get Connection String:** Navigate back to your cluster's "Overview" tab and click "Connect". Choose "Drivers", and you will see your MongoDB connection string. It will look something like this:
    ```
    mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```

## 3. Integrating with Next.js

1.  **Install MongoDB Driver:**
    ```bash
    npm install mongodb
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project to store your database credentials securely. **Do not commit this file to version control.**

    ```.env.local
    MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/
    MONGODB_DB_NAME=habbospeed
    ```
    Replace `<YOUR_USERNAME>` and `<YOUR_PASSWORD>` with the credentials you created in Atlas.

3.  **Create a Database Client:**
    It's best practice to create a single, reusable MongoDB client instance. Create a new file `src/lib/mongodb.ts`:

    ```typescript
    // src/lib/mongodb.ts
    import { MongoClient } from 'mongodb';

    if (!process.env.MONGODB_URI) {
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }

    const uri = process.env.MONGODB_URI;
    const options = {};

    let client;
    let clientPromise: Promise<MongoClient>;

    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }

    export default clientPromise;
    ```

## 4. Example: Fetching Schedule Data

You can now use this client to interact with your database. For example, to replace the mock schedule data, you would:

1.  **Create a `schedules` collection** in your `habbospeed` database in MongoDB Atlas and insert the schedule documents.

2.  **Modify your page/component** to fetch data from MongoDB instead of the mock file.

    For example, in `src/app/schedule/page.tsx`, you could fetch data in the component (since it's a Server Component):

    ```tsx
    // src/app/schedule/page.tsx (Example)
    import clientPromise from '@/lib/mongodb';
    import ScheduleDisplay from '@/components/habbospeed/schedule-display';
    // ... other imports

    async function getSchedule() {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME);
      const schedule = await db.collection('schedules').find({}).toArray();
      // You might need to serialize the _id field if you pass it to a Client Component
      return JSON.parse(JSON.stringify(schedule));
    }

    export default async function SchedulePage() {
      const scheduleData = await getSchedule();

      return (
        <div className="container mx-auto p-4 md:p-8">
          <Card>
            <CardHeader>
              {/* ... */}
            </CardHeader>
            <CardContent>
              {/* Pass the fetched data to your display component */}
              <ScheduleDisplay schedule={scheduleData} />
            </CardContent>
          </Card>
        </div>
      );
    }
    ```

This pattern can be applied to all other features that rely on mock data, such as News, User Profiles, and DJ information.
