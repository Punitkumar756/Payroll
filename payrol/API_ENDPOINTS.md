# Payroll Management System - API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Headers
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

---

## 1. TIMESHEETS API

### GET - Fetch All Timesheets
**Endpoint:** `GET /api/timesheets`
**Description:** Fetch all employee timesheets
**Response:**
```json
{
  "timesheets": [
    {
      "code": "EMP001",
      "name": "Rahul Sharma",
      "dept": "IT Department",
      "period": "May 2025 (01 May 2025 - 31 May 2025)",
      "month": "May 2025",
      "totalDays": "31.00",
      "daysPresent": "22.00",
      "daysAbsent": "2.00",
      "holidays": "2.00",
      "weekoffs": "4.00",
      "holidaysWorked": "1.00",
      "weekoffsWorked": "0.00",
      "hoursWorked": "176.00",
      "status": "Processed",
      "updated": "14 May 2025 10:30 AM"
    }
  ]
}
```

### GET - Fetch Single Timesheet
**Endpoint:** `GET /api/timesheets/:employeeCode`
**Description:** Fetch specific employee timesheet
**Response:** Single timesheet object

### POST - Create New Timesheet
**Endpoint:** `POST /api/timesheets`
**Description:** Create a new timesheet record
**Request Body:**
```json
{
  "name": "Employee Name",
  "dept": "IT Department",
  "period": "May 2025 (01 May 2025 - 31 May 2025)",
  "month": "May 2025",
  "totalDays": "31.00",
  "daysPresent": "22.00",
  "daysAbsent": "2.00",
  "holidays": "2.00",
  "weekoffs": "4.00",
  "hoursWorked": "176.00",
  "status": "Processed"
}
```

### PUT - Update Timesheet
**Endpoint:** `PUT /api/timesheets/:employeeCode`
**Description:** Update existing timesheet
**Request Body:** Same as POST

---

## 2. PAYSLIPS API

### GET - Fetch All Payslips
**Endpoint:** `GET /api/payslips`
**Query Parameters:** `?financialYear=2024-2025&payPeriod=May 2025`
**Response:**
```json
{
  "payslips": [
    {
      "id": "EMP001",
      "name": "Rahul Sharma",
      "payPeriod": "May 2025 (01 May - 31 May)",
      "netSalary": "40,300.00",
      "status": "Processed"
    }
  ]
}
```

### POST - Create Payslip
**Endpoint:** `POST /api/payslips`
**Request Body:**
```json
{
  "code": "EMP001",
  "name": "Employee Name",
  "dept": "IT Department",
  "financialYear": "2024-2025",
  "period": "May 2025 (01 May 2025 - 31 May 2025)",
  "status": "Success",
  "message": "Payslip processed successfully."
}
```

### PUT - Update Payslip
**Endpoint:** `PUT /api/payslips/:payslipId`
**Description:** Update payslip details

### DELETE - Delete Payslip
**Endpoint:** `DELETE /api/payslips/:payslipId`
**Description:** Delete a payslip record

---

## 3. PAYSLIP COMPONENTS API

### GET - Fetch All Components
**Endpoint:** `GET /api/payslip-components`
**Response:**
```json
{
  "components": {
    "earnings": [
      { "id": 1, "name": "Basic Salary", "description": "Basic Pay", "amount": "30,000.00" },
      { "id": 2, "name": "House Rent Allowance", "description": "House Rent", "amount": "12,000.00" }
    ],
    "deductions": [
      { "id": 1, "name": "Provident Fund", "description": "PF Employee", "amount": "1,800.00" }
    ],
    "employerComponents": [
      { "id": 1, "name": "Provident Fund (Employer)", "description": "PF Employer", "amount": "1,800.00" }
    ]
  }
}
```

### POST - Add Component
**Endpoint:** `POST /api/payslip-components`
**Request Body:**
```json
{
  "name": "Component Name",
  "description": "Component Description",
  "amount": "5000.00",
  "type": "earnings" // or "deductions" or "employerComponents"
}
```

### PUT - Update Component
**Endpoint:** `PUT /api/payslip-components/:componentId`
**Request Body:** Same as POST

### DELETE - Delete Component
**Endpoint:** `DELETE /api/payslip-components/:componentId`

---

## 4. SALARY HEADS API

### GET - Fetch All Salary Heads
**Endpoint:** `GET /api/salary-heads`
**Response:**
```json
{
  "salaryHeads": [
    {
      "id": 1,
      "code": "BAS",
      "name": "Basic Salary",
      "salaryType": "Earnings",
      "headCategory": "Basic",
      "expression": "BAS * (PAID_DAYS / TOTALDAYS)",
      "description": "Basic salary paid based on number of days present"
    }
  ]
}
```

### GET - Fetch Single Salary Head
**Endpoint:** `GET /api/salary-heads/:id`

### POST - Create Salary Head
**Endpoint:** `POST /api/salary-heads`
**Request Body:**
```json
{
  "code": "BAS",
  "name": "Basic Salary",
  "salaryType": "Earnings",
  "headCategory": "Basic",
  "expression": "BAS * (PAID_DAYS / TOTALDAYS)",
  "description": "Basic salary calculation formula"
}
```

### PUT - Update Salary Head
**Endpoint:** `PUT /api/salary-heads/:id`
**Request Body:** Same as POST

### DELETE - Delete Salary Head
**Endpoint:** `DELETE /api/salary-heads/:id`

---

## 5. ADVANCE PAYMENTS API

### GET - Fetch Form Options
**Endpoint:** `GET /api/advance-payments/options`
**Response:**
```json
{
  "employees": ["EMP001", "EMP002", ...],
  "financialYears": ["2024-2025", "2025-2026"],
  "payPeriods": ["May 2025", "June 2025"],
  "items": ["Advance Salary", "Travel Advance", "Festival Advance"]
}
```

### GET - Fetch All Advance Payments
**Endpoint:** `GET /api/advance-payments`
**Response:**
```json
{
  "payments": [
    {
      "id": 1,
      "employee": "EMP001",
      "financialYear": "2024-2025",
      "payPeriod": "May 2025",
      "item": "Advance Salary",
      "amount": "5000.00",
      "remarks": "Employee request",
      "status": "Approved",
      "createdAt": "2025-05-14"
    }
  ]
}
```

### POST - Create Advance Payment
**Endpoint:** `POST /api/advance-payments`
**Request Body:**
```json
{
  "employee": "EMP001",
  "financialYear": "2024-2025",
  "payPeriod": "May 2025",
  "item": "Advance Salary",
  "amount": "5000.00",
  "remarks": "Optional remarks"
}
```

### PUT - Update Advance Payment
**Endpoint:** `PUT /api/advance-payments/:paymentId`
**Request Body:** Same as POST

### DELETE - Delete Advance Payment
**Endpoint:** `DELETE /api/advance-payments/:paymentId`

---

## 6. APPROVE PAYSLIP API

### GET - Fetch Dropdown Options
**Endpoint:** `GET /api/payroll/options`
**Response:**
```json
{
  "financialYears": ["2025-2026", "2024-2025"],
  "payPeriods": ["May 2026", "April 2026"],
  "departments": ["IT Department", "HR Department", "Finance Department"]
}
```

### GET - Fetch Payslips for Approval
**Endpoint:** `GET /api/payroll/payslips?financialYear=2025-2026&payPeriod=May%202026`
**Response:**
```json
{
  "payslips": [
    {
      "id": "EMP001",
      "name": "Rahul Sharma",
      "department": "IT Department",
      "status": "Pending",
      "netSalary": "40,300.00"
    }
  ]
}
```

### PUT - Approve/Reject Payslips
**Endpoint:** `PUT /api/payroll/payslips/approve`
**Request Body:**
```json
{
  "payslipIds": ["EMP001", "EMP002"],
  "status": "Approved", // or "Rejected"
  "remarks": "Optional approval remarks"
}
```

---

## 7. PROCESS PAYSLIP API

### GET - Fetch Payslips
**Endpoint:** `GET /api/payslips?financialYear=2024-2025&payPeriod=May%202025`

### POST - Process New Payslip
**Endpoint:** `POST /api/payslips`
**Request Body:**
```json
{
  "code": "EMP001",
  "name": "Employee Name",
  "dept": "IT Department",
  "financialYear": "2024-2025",
  "period": "May 2025 (01 May 2025 - 31 May 2025)",
  "status": "Success"
}
```

### PUT - Update Processed Payslip
**Endpoint:** `PUT /api/payslips/:payslipId`

---

## Error Handling

All endpoints should return consistent error responses:

### Error Response Format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Success Response Format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

---

## Notes for Backend Development:

1. Implement request validation for all endpoints
2. Add proper error handling and logging
3. Implement authentication/authorization if needed
4. Add rate limiting for production
5. Implement database transactions for multi-step operations
6. Add data pagination for GET endpoints with large datasets
7. Implement soft deletes instead of hard deletes where appropriate
8. Add audit logging for create/update/delete operations

