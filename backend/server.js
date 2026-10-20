require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3103;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory Employee Data (Default seed & fallback)
let employees = [
  {
    id: "1",
    name: "John Doe",
    position: "Software Engineer",
    status: "Active",
    salary: 45000
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    position: "Junior Developer",
    status: "Active",
    salary: 22000
  },
  {
    id: "3",
    name: "Michael Chang",
    position: "Office Assistant",
    status: "On Leave",
    salary: 18000
  },
  {
    id: "4",
    name: "Emily Watson",
    position: "Project Manager",
    status: "Active",
    salary: 52000
  },
  {
    id: "5",
    name: "David Kim",
    position: "Engineering Director",
    status: "Active",
    salary: 95000
  },
  {
    id: "6",
    name: "Jessica Taylor",
    position: "VP of Technology",
    status: "On Leave",
    salary: 85000
  }
];

let nextId = 7;

// MySQL Cloud Database Connection
let pool = null;
let useDb = false;
let tableName = process.env.TABLE_NAME || 'NinSom_Employee';

try {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'std6730251417',
    password: process.env.DB_PASSWORD || 't7!s9Wqz',
    database: process.env.DB_NAME || 'ip_std6730251417',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 5000
  });

  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Cloud Database (ip_std6730251417) successfully');

      // Check primary table
      const [t1] = await conn.query("SHOW TABLES LIKE 'NinSom_Employee'");
      if (t1.length > 0) {
        tableName = 'NinSom_Employee';
        useDb = true;
      } else {
        const [t2] = await conn.query("SHOW TABLES LIKE 'employees'");
        if (t2.length > 0) {
          tableName = 'employees';
          useDb = true;
        }
      }
      conn.release();
      console.log(`Database storage: ${useDb ? 'Active on table `' + tableName + '`' : 'In-memory fallback'}`);
    } catch (err) {
      console.log('⚠️ MySQL connection unavailable, running with in-memory storage:', err.message);
      useDb = false;
    }
  })();
} catch (e) {
  useDb = false;
}

// Helper function to extract employee fields regardless of column prefix
function normalizeRow(r) {
  return {
    id: String(r.NinSom_ID_Employee || r.Kanwit_Wutt_ID_Employee || r.id),
    name: r.NinSom_Name_Employee || r.Kanwit_Wutt_Name_Employee || r.name,
    position: r.NinSom_Position_Employee || r.Kanwit_Wutt_Position_Employee || r.position,
    status: r.NinSom_Status_Employee || r.Kanwit_Wutt_Status_Employee || r.status || 'Active',
    salary: Number(r.NinSom_Salary_Employee || r.Kanwit_Wutt_Salary_Employee || r.salary)
  };
}

// ==========================================
// Phase 1: Authentication & CRUD Endpoints
// ==========================================

// POST /api/login - Authentication (Login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password123') {
    return res.status(200).json({
      success: true,
      token: "mock-jwt-token-kanwit-6730251417",
      user: { username: "admin", role: "admin" }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
});

// GET /api/employees - Return all employee records
app.get('/api/employees', async (req, res) => {
  if (useDb && pool) {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` ORDER BY 1 ASC`);
      if (rows && rows.length > 0) {
        return res.status(200).json(rows.map(normalizeRow));
      }
    } catch (err) {
      console.error('DB query error, fallback to memory:', err.message);
    }
  }

  return res.status(200).json(employees);
});

// POST /api/employees - Add a new employee
app.post('/api/employees', async (req, res) => {
  const { name, position, salary } = req.body;

  // Validation: Must receive name, position, and numeric salary. If empty -> 400 Bad Request
  if (
    name === undefined || name === null || String(name).trim() === '' ||
    position === undefined || position === null || String(position).trim() === '' ||
    salary === undefined || salary === null || String(salary).trim() === '' ||
    isNaN(Number(salary)) || Number(salary) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Bad Request: 'name', 'position', and positive numeric 'salary' are required."
    });
  }

  const numericSalary = Number(salary);
  let newEmployee = {
    id: String(nextId++),
    name: String(name).trim(),
    position: String(position).trim(),
    status: "Active",
    salary: numericSalary
  };

  if (useDb && pool) {
    try {
      if (tableName === 'NinSom_Employee') {
        const [result] = await pool.query(
          `INSERT INTO \`NinSom_Employee\` (NinSom_Name_Employee, NinSom_Position_Employee, NinSom_Status_Employee, NinSom_Salary_Employee) VALUES (?, ?, 'Active', ?)`,
          [newEmployee.name, newEmployee.position, newEmployee.salary]
        );
        if (result && result.insertId) newEmployee.id = String(result.insertId);
      } else {
        const [result] = await pool.query(
          `INSERT INTO \`${tableName}\` (name, position, status, salary) VALUES (?, ?, 'Active', ?)`,
          [newEmployee.name, newEmployee.position, newEmployee.salary]
        );
        if (result && result.insertId) newEmployee.id = String(result.insertId);
      }

      // Also sync to employees table if separate
      pool.query(
        `INSERT INTO \`employees\` (id, name, position, status, salary) VALUES (?, ?, ?, 'Active', ?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [newEmployee.id, newEmployee.name, newEmployee.position, newEmployee.salary]
      ).catch(() => {});
    } catch (err) {
      console.error('DB insert error, saving to memory:', err.message);
    }
  }

  employees.push(newEmployee);

  return res.status(201).json({
    success: true,
    employee: newEmployee
  });
});

// PUT /api/employees/:id/status - Toggle employee's status (Active <-> On Leave)
app.put('/api/employees/:id/status', async (req, res) => {
  const { id } = req.params;

  if (useDb && pool) {
    try {
      const idCol = tableName === 'NinSom_Employee' ? 'NinSom_ID_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_ID_Employee' : 'id');
      const statusCol = tableName === 'NinSom_Employee' ? 'NinSom_Status_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Status_Employee' : 'status');

      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${idCol}\` = ?`, [id]);
      if (rows && rows.length > 0) {
        const current = normalizeRow(rows[0]);
        const nextStatus = current.status === 'Active' ? 'On Leave' : 'Active';
        await pool.query(`UPDATE \`${tableName}\` SET \`${statusCol}\` = ? WHERE \`${idCol}\` = ?`, [nextStatus, id]);
        
        // Also update employees table
        pool.query(`UPDATE \`employees\` SET status = ? WHERE id = ?`, [nextStatus, id]).catch(() => {});

        current.status = nextStatus;
        return res.status(200).json({
          success: true,
          employee: current
        });
      }
    } catch (err) {
      console.error('DB update error, fallback to memory:', err.message);
    }
  }

  const employee = employees.find(e => e.id === String(id));
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: `Employee with id ${id} not found.`
    });
  }

  employee.status = employee.status === 'Active' ? 'On Leave' : 'Active';

  return res.status(200).json({
    success: true,
    employee
  });
});

// DELETE /api/employees/:id - Remove employee from the system
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;

  if (useDb && pool) {
    try {
      const idCol = tableName === 'NinSom_Employee' ? 'NinSom_ID_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_ID_Employee' : 'id');
      const [result] = await pool.query(`DELETE FROM \`${tableName}\` WHERE \`${idCol}\` = ?`, [id]);
      pool.query(`DELETE FROM \`employees\` WHERE id = ?`, [id]).catch(() => {});

      if (result && result.affectedRows > 0) {
        employees = employees.filter(e => e.id !== String(id));
        return res.status(200).json({
          success: true,
          message: "Employee deleted successfully."
        });
      }
    } catch (err) {
      console.error('DB delete error, fallback to memory:', err.message);
    }
  }

  const index = employees.findIndex(e => e.id === String(id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Employee with id ${id} not found.`
    });
  }

  const deleted = employees.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: "Employee deleted successfully.",
    employee: deleted
  });
});

// ==========================================
// Phase 2: K-Means Salary Clustering (k=3)
// ==========================================

function run1DKMeans(salaries, k = 3, maxIterations = 100) {
  if (!salaries || salaries.length === 0) return [];

  const actualK = Math.min(k, salaries.length);
  const sorted = [...salaries].sort((a, b) => a - b);

  // Initialize centroids evenly spaced across the sorted dataset
  let centroids = [];
  for (let i = 0; i < actualK; i++) {
    const idx = Math.floor((i / (actualK - 1 || 1)) * (sorted.length - 1));
    centroids.push(sorted[idx]);
  }

  let clusters = Array.from({ length: actualK }, () => []);

  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: actualK }, () => []);

    // Assign each salary to nearest centroid
    for (const val of salaries) {
      let minDist = Infinity;
      let closestIdx = 0;
      for (let c = 0; c < actualK; c++) {
        const dist = Math.abs(val - centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = c;
        }
      }
      clusters[closestIdx].push(val);
    }

    // Recompute centroids
    let changed = false;
    for (let c = 0; c < actualK; c++) {
      if (clusters[c].length > 0) {
        const sum = clusters[c].reduce((acc, curr) => acc + curr, 0);
        const newCentroid = sum / clusters[c].length;
        if (Math.abs(newCentroid - centroids[c]) > 0.001) {
          centroids[c] = newCentroid;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  // Format and sort results ascending by centroid value
  const clusterData = centroids.map((c, index) => ({
    centroid: Math.round(c),
    count: clusters[index].length
  })).sort((a, b) => a.centroid - b.centroid);

  // Guarantee 3 tiers in response
  const result = [];
  for (let i = 0; i < 3; i++) {
    if (i < clusterData.length) {
      result.push({
        group: `Tier ${i + 1}`,
        centroid: clusterData[i].centroid,
        count: clusterData[i].count
      });
    } else {
      result.push({
        group: `Tier ${i + 1}`,
        centroid: 0,
        count: 0
      });
    }
  }

  return result;
}

// GET /api/employees/salary-clusters
app.get('/api/employees/salary-clusters', async (req, res) => {
  try {
    let currentSalaries = [];

    if (useDb && pool) {
      try {
        const salCol = tableName === 'NinSom_Employee' ? 'NinSom_Salary_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Salary_Employee' : 'salary');
        const [rows] = await pool.query(`SELECT \`${salCol}\` AS salary FROM \`${tableName}\``);
        if (rows && rows.length > 0) {
          currentSalaries = rows.map(r => Number(r.salary)).filter(s => !isNaN(s));
        }
      } catch (err) {
        console.error('DB query for clusters error:', err.message);
      }
    }

    if (currentSalaries.length === 0) {
      currentSalaries = employees.map(e => Number(e.salary)).filter(s => !isNaN(s));
    }

    const clusters = run1DKMeans(currentSalaries, 3);

    return res.status(200).json({
      success: true,
      clusters
    });
  } catch (error) {
    console.error("Error computing salary clusters:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during clustering."
    });
  }
});

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    message: "HR Manager & Salary Analytics API is running",
    course: "Internet Programming Final Exam (2026)",
    student: "Kanwit Voottikulsin (std6730251417)",
    port: PORT,
    storage: useDb ? `Cloud MySQL (${tableName})` : "In-memory",
    database: "ip_std6730251417"
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
});
