// Automated test script for HR Manager & Salary Analytics API
const http = require('http');

const PORT = process.env.PORT || 3103;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("   AUTOMATED VERIFICATION: HR MANAGER & ANALYTICS ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Root status
    let r = await request('GET', '/');
    assert(r.status === 200, "1. Root endpoint returns 200 OK");

    // 2. Login success
    r = await request('POST', '/api/login', { username: 'admin', password: 'password123' });
    assert(r.status === 200 && r.data.success && r.data.token, "2. Valid login grants access and returns token");

    // 3. Login failure
    r = await request('POST', '/api/login', { username: 'admin', password: 'wrongpassword' });
    assert(r.status === 401 && !r.data.success, "3. Invalid login correctly returns 401 Unauthorized");

    // 4. Get all employees
    r = await request('GET', '/api/employees');
    assert(r.status === 200 && Array.isArray(r.data) && r.data.length >= 6, `4. GET /api/employees returns ${r.data.length} records`);

    // 5. Add new employee (Success)
    const newEmp = { name: "Test Candidate", position: "QA Engineer", salary: 38000 };
    r = await request('POST', '/api/employees', newEmp);
    assert(r.status === 201 && r.data.success && r.data.employee.name === "Test Candidate", "5. POST /api/employees successfully creates employee (201 Created)");
    const createdId = r.data.employee ? r.data.employee.id : null;

    // 6. Add employee validation failure (Empty field)
    r = await request('POST', '/api/employees', { name: "", position: "QA", salary: 30000 });
    assert(r.status === 400 && !r.data.success, "6. POST with empty name rejected with 400 Bad Request");

    // 7. Add employee validation failure (Invalid salary)
    r = await request('POST', '/api/employees', { name: "Invalid", position: "QA", salary: "not-a-number" });
    assert(r.status === 400 && !r.data.success, "7. POST with non-numeric salary rejected with 400 Bad Request");

    // 8. Toggle status
    if (createdId) {
      r = await request('PUT', `/api/employees/${createdId}/status`);
      assert(r.status === 200 && r.data.success && r.data.employee.status === "On Leave", "8. PUT /api/employees/:id/status toggles Active -> On Leave");

      r = await request('PUT', `/api/employees/${createdId}/status`);
      assert(r.status === 200 && r.data.success && r.data.employee.status === "Active", "9. PUT /api/employees/:id/status toggles On Leave -> Active");

      // 10. Delete employee
      r = await request('DELETE', `/api/employees/${createdId}`);
      assert(r.status === 200 && r.data.success, "10. DELETE /api/employees/:id removes employee successfully");
    }

    // 11. Delete non-existent
    r = await request('DELETE', `/api/employees/999999`);
    assert(r.status === 404, "11. DELETE non-existent id returns 404 Not Found");

    // 12. K-Means Salary Clustering (Phase 2)
    r = await request('GET', '/api/employees/salary-clusters');
    assert(
      r.status === 200 && r.data.success && Array.isArray(r.data.clusters) && r.data.clusters.length === 3,
      "12. GET /api/employees/salary-clusters returns 3 Tiers"
    );
    if (r.data.clusters) {
      console.log("    Clusters output:", JSON.stringify(r.data.clusters));
      assert(r.data.clusters[0].group === "Tier 1", "    Tier 1 correctly grouped");
      assert(r.data.clusters[1].group === "Tier 2", "    Tier 2 correctly grouped");
      assert(r.data.clusters[2].group === "Tier 3", "    Tier 3 correctly grouped");
    }

    console.log("==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");
  } catch (err) {
    console.error("Test execution error:", err);
  }
}

runTests();
