import express from "express";
import { createServer } from "http";
import bcrypt from "bcryptjs";

// Force MemStorage for isolation during testing so we don't pollute the cloud Neon DB
process.env.DATABASE_URL = "";
process.env.USE_MEMSTORAGE = "true";
process.env.JWT_SECRET = "test_jwt_secret_key_for_security_suite";

async function runSecurityTests() {
  console.log("\n=======================================================");
  console.log("🛡️  HABBOSPEED SECURITY SUITE: PANEL PROTECTION TESTS  🛡️");
  console.log("=======================================================\n");

  // Mock Habbo API fetch calls
  const originalFetch = global.fetch;
  global.fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("https://www.habbo.es/api/public/users")) {
      return new Response(JSON.stringify({
        name: "HabboUser1",
        motto: "VERIFY_ME",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return originalFetch(input, init);
  };


  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);

  // Register all server routes dynamically to prevent ESM hoisting from overriding env vars
  const { registerRoutes } = await import("../server/routes");
  await registerRoutes(httpServer, app);

  // Start temporary test server on port 5051
  const port = 5051;
  const server = httpServer.listen(port, "127.0.0.1");
  const baseUrl = `http://127.0.0.1:${port}`;

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Anonymous (Unauthenticated) Access Protection
    // ----------------------------------------------------
    console.log("-------------------------------------------------------");
    console.log("Test Phase 1: Anonymous Access (No Token)");
    console.log("-------------------------------------------------------");

    // Anonymous request to get users list
    const anonUsersRes = await fetch(`${baseUrl}/api/users`);
    assert(
      anonUsersRes.status === 401,
      `GET /api/users anonymous request returned ${anonUsersRes.status} (expected 401 Unauthorized)`
    );

    // Anonymous request to update configuration
    const anonConfigRes = await fetch(`${baseUrl}/api/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenanceMode: false }),
    });
    assert(
      anonConfigRes.status === 401,
      `PUT /api/config anonymous request returned ${anonConfigRes.status} (expected 401 Unauthorized)`
    );

    // Anonymous request to get panel logs
    const anonLogsRes = await fetch(`${baseUrl}/api/panel-logs`);
    assert(
      anonLogsRes.status === 401,
      `GET /api/panel-logs anonymous request returned ${anonLogsRes.status} (expected 401 Unauthorized)`
    );


    // ----------------------------------------------------
    // TEST 2: Regular User Access Restrictions
    // ----------------------------------------------------
    console.log("\n-------------------------------------------------------");
    console.log("Test Phase 2: Regular User Restrictions (Pending Role)");
    console.log("-------------------------------------------------------");

    // Register a new test user (default role is "pending" / "user")
    const testUserEmail = "testuser@habbospeed.com";
    const testUserPassword = "userpass123";
    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserEmail,
        password: testUserPassword,
        displayName: "Regular User",
        habboUsername: "HabboUser1",
        verificationCode: "VERIFY_ME",
      }),
    });
    
    assert(registerRes.status === 201, `Registering a new test user returned ${registerRes.status} (expected 201 Created)`);
    const registerData = await registerRes.json() as any;
    const userToken = registerData.token;
    assert(!!userToken, "Successfully obtained authentication token for regular user");

    // Normal user attempts to read users database (administrative only)
    const userReadUsersRes = await fetch(`${baseUrl}/api/users`, {
      headers: { "Authorization": `Bearer ${userToken}` },
    });
    assert(
      userReadUsersRes.status === 403,
      `GET /api/users (Regular User) returned ${userReadUsersRes.status} (expected 403 Forbidden)`
    );

    // Normal user attempts to modify system config
    const userPutConfigRes = await fetch(`${baseUrl}/api/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({ maintenanceMode: false }),
    });
    assert(
      userPutConfigRes.status === 403,
      `PUT /api/config (Regular User) returned ${userPutConfigRes.status} (expected 403 Forbidden)`
    );

    // Normal user attempts to fetch audit logs
    const userGetLogsRes = await fetch(`${baseUrl}/api/panel-logs`, {
      headers: { "Authorization": `Bearer ${userToken}` },
    });
    assert(
      userGetLogsRes.status === 403,
      `GET /api/panel-logs (Regular User) returned ${userGetLogsRes.status} (expected 403 Forbidden)`
    );


    // ----------------------------------------------------
    // TEST 3: Default Admin Access Verification
    // ----------------------------------------------------
    console.log("\n-------------------------------------------------------");
    console.log("Test Phase 3: Default Administrator Access");
    console.log("-------------------------------------------------------");

    // Logging in with seeded admin credentials
    const adminEmail = "admin@habbospeed.com";
    const adminPassword = "admin123";
    
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    assert(loginRes.status === 200, `Login with default admin credentials returned ${loginRes.status} (expected 200 OK)`);
    const loginData = await loginRes.json() as any;
    const adminToken = loginData.token;
    assert(!!adminToken, "Successfully obtained admin token from login endpoint");
    assert(loginData.role === "admin", `User role is verified as '${loginData.role}' (expected 'admin')`);

    // Admin attempts to read users list
    const adminReadUsersRes = await fetch(`${baseUrl}/api/users`, {
      headers: { "Authorization": `Bearer ${adminToken}` },
    });
    assert(
      adminReadUsersRes.status === 200,
      `GET /api/users (Admin) returned ${adminReadUsersRes.status} (expected 200 OK)`
    );
    const usersList = await adminReadUsersRes.json() as any[];
    assert(Array.isArray(usersList), `GET /api/users returned an array of users (size: ${usersList?.length})`);
    
    // Admin attempts to fetch panel logs
    const adminLogsResGet = await fetch(`${baseUrl}/api/panel-logs`, {
      headers: { "Authorization": `Bearer ${adminToken}` },
    });
    assert(
      adminLogsResGet.status === 200,
      `GET /api/panel-logs (Admin) returned ${adminLogsResGet.status} (expected 200 OK)`
    );

    // Admin attempts to update system config
    const adminConfigResPut = await fetch(`${baseUrl}/api/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ maintenanceMode: false }),
    });
    assert(
      adminConfigResPut.status === 200,
      `PUT /api/config (Admin) returned ${adminConfigResPut.status} (expected 200 OK)`
    );

  } catch (error: any) {
    console.error("An error occurred during security tests:", error);
    testsFailed++;
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
    // Terminate server cleanly
    server.close();
    console.log("\n=======================================================");
    console.log("🏁  SECURITY TESTING RESULTS SUMMARY");
    console.log("=======================================================");
    console.log(` 🎉 Passed: ${testsPassed}`);
    console.log(` ❌ Failed: ${testsFailed}`);
    console.log("=======================================================\n");

    if (testsFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runSecurityTests();
