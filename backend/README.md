# Cloud Database Backend (Express + MySQL)

## 📌 Server Details
- **Cloud Host:** `119.59.102.161`
- **SSH Port:** `2222`
- **phpMyAdmin:** `http://119.59.102.161/nindamdb`
- **User:** `std6730251417`
- **Database:** `ip_std6730251417`

## 🚀 Deployment Instructions

### 1. Upload via FileZilla (SFTP)
- **Host:** `sftp://119.59.102.161`
- **Port:** `2222`
- **Username:** `std6730251417`
- **Password:** *(your account password)*
- Upload files (`server.js`, `package.json`, `.env`) to `/app` or `/home/std6730251417`

### 2. Connect via SSH (PuTTY / CMD)
```bash
ssh -p 2222 std6730251417@119.59.102.161
```

### 3. Install & Start Backend
```bash
npm ci
node server.js
```

### 4. Verify API Endpoints
- Health check: `http://119.59.102.161:<PORT>/api`
- Products API: `http://119.59.102.161:<PORT>/api/products`