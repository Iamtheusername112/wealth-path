# CapitalPath API Documentation

Complete API reference for all backend endpoints in CapitalPath.

## Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://your-domain.vercel.app/api`

## Authentication

All API routes (except auth routes) require authentication via Kinde. The authentication is handled automatically through middleware for protected routes.

---

## Authentication Endpoints

### Kinde Auth Routes

Managed by `@kinde-oss/kinde-auth-nextjs`

#### Login
- **GET** `/api/auth/login`
- Redirects to Kinde login page
- No body required

#### Register
- **GET** `/api/auth/register`
- Redirects to Kinde registration page
- No body required

#### Logout
- **GET** `/api/auth/logout`
- Logs out user and clears session
- Redirects to homepage

#### Callback
- **GET** `/api/auth/kinde_callback`
- Handles OAuth callback from Kinde
- Managed automatically

---

## KYC Endpoints

### Submit KYC

Submit KYC verification documents and personal information.

- **POST** `/api/kyc/submit`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`

**Form Data:**
\`\`\`typescript
{
  userId: string
  email: string
  fullName: string
  dob: string (YYYY-MM-DD)
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  documentType: 'passport' | 'national_id' | 'drivers_license'
  documentFront: File
  documentBack: File (optional)
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "KYC submitted successfully"
}
\`\`\`

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

---

## Transaction Endpoints

### Deposit Funds

Add money to user account.

- **POST** `/api/transactions/deposit`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "amount": number,
  "method": "bank_transfer" | "debit_card" | "credit_card" | "wire_transfer"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "user_id": "string",
    "type": "deposit",
    "amount": number,
    "description": "string",
    "status": "completed",
    "created_at": "timestamp"
  },
  "newBalance": number
}
\`\`\`

**Error Responses:**
- `400`: Invalid amount
- `401`: Unauthorized
- `500`: Failed to update balance

---

### Withdraw Funds

Withdraw money from user account.

- **POST** `/api/transactions/withdraw`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "amount": number,
  "method": "bank_transfer" | "wire_transfer" | "check"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "user_id": "string",
    "type": "withdrawal",
    "amount": number,
    "description": "string",
    "status": "completed",
    "created_at": "timestamp"
  },
  "newBalance": number
}
\`\`\`

**Error Responses:**
- `400`: Invalid amount or insufficient balance
- `401`: Unauthorized
- `500`: Failed to update balance

---

### Transfer Money

Transfer money to another user.

- **POST** `/api/transactions/transfer`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "amount": number,
  "recipientEmail": "string",
  "description": "string (optional)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "user_id": "string",
    "type": "transfer",
    "amount": number,
    "description": "string",
    "recipient_id": "string",
    "status": "completed",
    "created_at": "timestamp"
  },
  "newBalance": number
}
\`\`\`

**Error Responses:**
- `400`: Invalid amount, insufficient balance, or cannot transfer to self
- `404`: Recipient not found
- `401`: Unauthorized
- `500`: Failed to complete transfer

---

## Investment Endpoints

### Create Investment

Invest in an asset.

- **POST** `/api/investments/create`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "category": "crypto" | "stocks" | "forex" | "commodities" | "real_estate",
  "assetName": "string",
  "assetSymbol": "string",
  "amount": number,
  "quantity": number,
  "purchasePrice": number
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "investment": {
    "id": "uuid",
    "user_id": "string",
    "category": "string",
    "asset_name": "string",
    "amount": number,
    "quantity": number,
    "purchase_price": number,
    "current_price": number,
    "status": "active",
    "created_at": "timestamp"
  },
  "newBalance": number
}
\`\`\`

**Error Responses:**
- `400`: Invalid amount or insufficient balance
- `401`: Unauthorized
- `500`: Failed to create investment

---

## Admin Endpoints

### KYC Action (Approve/Reject)

Approve or reject user KYC verification.

- **POST** `/api/admin/kyc-action`
- **Auth Required**: Yes (Admin only)
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "action": "approve" | "reject"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "status": "approved" | "rejected"
}
\`\`\`

**Error Responses:**
- `400`: Missing required fields
- `401`: Unauthorized
- `403`: Not an admin
- `500`: Failed to update KYC status

---

## Notification Endpoints

### Mark Notification as Read

Mark a single notification as read.

- **POST** `/api/notifications/mark-read`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "notificationId": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Error Responses:**
- `400`: Missing notification ID
- `401`: Unauthorized
- `500`: Failed to mark as read

---

### Mark All Notifications as Read

Mark all user notifications as read.

- **POST** `/api/notifications/mark-all-read`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Error Responses:**
- `401`: Unauthorized
- `500`: Failed to mark notifications as read

---

## Settings Endpoints

### Update Profile

Update user profile information.

- **POST** `/api/settings/update-profile`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body:**
\`\`\`json
{
  "userId": "string",
  "fullName": "string",
  "address": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

**Error Responses:**
- `401`: Unauthorized
- `500`: Failed to update profile

---

## Error Handling

All endpoints follow a consistent error response format:

\`\`\`json
{
  "error": "Error message description"
}
\`\`\`

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting using:
- Vercel Edge Config
- Upstash Redis
- Custom middleware

---

## Testing the API

### Using cURL

**Example: Deposit Funds**
\`\`\`bash
curl -X POST http://localhost:3000/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "amount": 1000,
    "method": "bank_transfer"
  }'
\`\`\`

**Example: Create Investment**
\`\`\`bash
curl -X POST http://localhost:3000/api/investments/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "category": "crypto",
    "assetName": "Bitcoin",
    "assetSymbol": "BTC",
    "amount": 1000,
    "quantity": 0.022,
    "purchasePrice": 45000
  }'
\`\`\`

### Using Postman

1. Import the API endpoints
2. Set up authentication with Kinde
3. Configure environment variables
4. Test each endpoint

---

## Security Considerations

### Best Practices Implemented

1. **Authentication**: All routes require valid Kinde session
2. **Authorization**: User can only access their own data
3. **Validation**: Server-side validation on all inputs
4. **SQL Injection**: Using Supabase parameterized queries
5. **XSS Protection**: React automatically escapes content
6. **CSRF**: Protected by SameSite cookies

### Recommendations for Production

1. Implement rate limiting
2. Add request logging
3. Enable CORS with specific origins
4. Use HTTPS only
5. Implement API versioning
6. Add request validation middleware
7. Monitor API usage

---

## Changelog

### v1.0.0 (Current)
- Initial release
- All core endpoints implemented
- Authentication with Kinde
- Database integration with Supabase
- Complete CRUD operations

---

## Support

For API issues or questions:
- Check the error message
- Review request format
- Verify authentication
- Check server logs
- Consult this documentation

---

**Last Updated**: October 2025  
**API Version**: 1.0.0

