require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3103;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
let tableName = process.env.TABLE_NAME || 'kanwit_6730251417_employee';

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
      const [t1] = await conn.query("SHOW TABLES LIKE 'kanwit_6730251417_employee'");
      if (t1.length > 0) {
        tableName = 'kanwit_6730251417_employee';
        useDb = true;
      } else {
        const [t2] = await conn.query("SHOW TABLES LIKE 'FinalExam_Kanwit_Wutt_Employee'");
        if (t2.length > 0) {
          tableName = 'FinalExam_Kanwit_Wutt_Employee';
          useDb = true;
        } else {
          const [t3] = await conn.query("SHOW TABLES LIKE 'employees'");
          if (t3.length > 0) {
            tableName = 'employees';
            useDb = true;
          }
        }
      }
      conn.release();
      console.log(`Database storage: ${useDb ? 'Active on table `' + tableName + '`' : 'In-memory fallback'}`);
    } catch (err) {
      console.log('⚠️  MySQL connection unavailable, running with in-memory storage:', err.message);
      useDb = false;
    }
  })();
} catch (e) {
  useDb = false;
}

// Helper function to extract employee fields regardless of column prefix
function normalizeRow(r) {
  return {
    id: String(r.kanwit_6730251417_ID_Employee || r.kanwit_ID_Employee || r.Kanwit_Wutt_ID_Employee || r.NinSom_ID_Employee || r.id),
    name: r.kanwit_6730251417_Name_Employee || r.kanwit_Name_Employee || r.Kanwit_Wutt_Name_Employee || r.NinSom_Name_Employee || r.name,
    position: r.kanwit_6730251417_Position_Employee || r.kanwit_Position_Employee || r.Kanwit_Wutt_Position_Employee || r.NinSom_Position_Employee || r.position,
    status: r.kanwit_6730251417_Status_Employee || r.kanwit_Status_Employee || r.Kanwit_Wutt_Status_Employee || r.NinSom_Status_Employee || r.status || 'Active',
    salary: Number(r.kanwit_6730251417_Salary_Employee || r.kanwit_Salary_Employee || r.Kanwit_Wutt_Salary_Employee || r.NinSom_Salary_Employee || r.salary)
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
      if (tableName === 'kanwit_6730251417_employee') {
        const [result] = await pool.query(
          `INSERT INTO \`kanwit_6730251417_employee\` (kanwit_6730251417_Name_Employee, kanwit_6730251417_Position_Employee, kanwit_6730251417_Status_Employee, kanwit_6730251417_Salary_Employee) VALUES (?, ?, 'Active', ?)`,
          [newEmployee.name, newEmployee.position, newEmployee.salary]
        );
        if (result && result.insertId) newEmployee.id = String(result.insertId);
      } else if (tableName === 'FinalExam_Kanwit_Wutt_Employee') {
        const [result] = await pool.query(
          `INSERT INTO \`FinalExam_Kanwit_Wutt_Employee\` (Kanwit_Wutt_Name_Employee, Kanwit_Wutt_Position_Employee, Kanwit_Wutt_Status_Employee, Kanwit_Wutt_Salary_Employee) VALUES (?, ?, 'Active', ?)`,
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
      const idCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_ID_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_ID_Employee' : (tableName === 'NinSom_Employee' ? 'NinSom_ID_Employee' : 'id'));
      const statusCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Status_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Status_Employee' : (tableName === 'NinSom_Employee' ? 'NinSom_Status_Employee' : 'status'));

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

// PUT /api/employees/:id - Update employee details (Name, Position, Salary, Status)
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position, salary, status } = req.body;

  if (useDb && pool) {
    try {
      const idCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_ID_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_ID_Employee' : 'id');
      const nameCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Name_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Name_Employee' : 'name');
      const posCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Position_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Position_Employee' : 'position');
      const salCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Salary_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Salary_Employee' : 'salary');
      const statCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Status_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Status_Employee' : 'status');

      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${idCol}\` = ?`, [id]);
      if (rows && rows.length > 0) {
        const current = normalizeRow(rows[0]);
        const updatedName = name !== undefined ? String(name).trim() : current.name;
        const updatedPos = position !== undefined ? String(position).trim() : current.position;
        const updatedSal = salary !== undefined ? Number(salary) : current.salary;
        const updatedStat = status !== undefined ? String(status) : current.status;

        await pool.query(
          `UPDATE \`${tableName}\` SET \`${nameCol}\` = ?, \`${posCol}\` = ?, \`${salCol}\` = ?, \`${statCol}\` = ? WHERE \`${idCol}\` = ?`,
          [updatedName, updatedPos, updatedSal, updatedStat, id]
        );
        pool.query(`UPDATE \`employees\` SET name = ?, position = ?, salary = ?, status = ? WHERE id = ?`, [updatedName, updatedPos, updatedSal, updatedStat, id]).catch(() => {});

        return res.status(200).json({
          success: true,
          employee: { id: String(id), name: updatedName, position: updatedPos, status: updatedStat, salary: updatedSal }
        });
      }
    } catch (err) {
      console.error('DB update error:', err.message);
    }
  }

  const emp = employees.find(e => e.id === String(id));
  if (!emp) {
    return res.status(404).json({ success: false, message: `Employee with id ${id} not found.` });
  }

  if (name !== undefined) emp.name = String(name).trim();
  if (position !== undefined) emp.position = String(position).trim();
  if (salary !== undefined) emp.salary = Number(salary);
  if (status !== undefined) emp.status = String(status);

  return res.status(200).json({ success: true, employee: emp });
});

// DELETE /api/employees/:id - Remove employee from the system
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;

  if (useDb && pool) {
    try {
      const idCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_ID_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_ID_Employee' : (tableName === 'NinSom_Employee' ? 'NinSom_ID_Employee' : 'id'));
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
        const salCol = tableName === 'kanwit_6730251417_employee' ? 'kanwit_6730251417_Salary_Employee' : (tableName === 'FinalExam_Kanwit_Wutt_Employee' ? 'Kanwit_Wutt_Salary_Employee' : 'salary');
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
      totalEmployees: currentSalaries.length,
      clusters
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error calculating salary clusters: " + err.message
    });
  }
});

// Root route - serve Dashboard UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HR Manager & Salary Analytics System running on http://0.0.0.0:${PORT}`);
});

module.exports = { app, server, run1DKMeans };
