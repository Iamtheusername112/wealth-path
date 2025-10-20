# 🛡️ Admin Balance & Investment Control - Complete Guide

## 📋 Overview

Admins now have **full control** over user accounts, including the ability to:
- ✅ **Credit** or **Debit** user balances
- ✅ **Add** investments to user portfolios
- ✅ **Edit** existing investments (amount, price, status)
- ✅ **Remove** investments from portfolios
- ✅ All actions are **logged** and **notify** users automatically

---

## 🎯 Key Features

### 1. **Balance Management**
- Credit (add) funds to any user account
- Debit (remove) funds from any user account
- View current balance before adjusting
- Preview new balance before confirming
- Optional reason field (visible to user)
- Automatic transaction logging
- User notifications

### 2. **Investment Management**
- Add new investments to user portfolios
- Edit existing investment details
- Remove investments completely
- Set investment status (active/sold/pending)
- Track purchase and current prices
- Specify quantity and amounts
- All actions logged with reasons

---

## 🔐 Security & Access

### **Admin Authentication**
- Only users in the `admins` table can access these features
- Authentication verified via Clerk + Supabase
- Email-based admin verification
- All actions are audit-logged

### **Protected Endpoints**
```
POST /api/admin/adjust-balance
POST /api/admin/manage-investment
```

Both require:
- Valid Clerk authentication
- Admin email in database
- Returns 401 (Unauthorized) or 403 (Forbidden) if not admin

---

## 💰 Balance Management

### **How to Credit User Balance**

1. **Navigate**: Admin Dashboard → **Balance Control** tab
2. **Find User**: Locate the user in the list
3. **Click**: Green **"Credit"** button
4. **Enter Amount**: e.g., $1,000
5. **Optional Reason**: "Initial funding", "Refund", "Bonus", etc.
6. **Preview**: See old balance → new balance
7. **Confirm**: Click **"Credit Account"**

**What Happens:**
```javascript
Current Balance: $500
Credit: +$1,000
─────────────────────
New Balance: $1,500
```

**System Actions:**
- ✅ User balance updated to $1,500
- ✅ Transaction created (type: "deposit")
- ✅ Notification sent to user
- ✅ Admin sees success toast
- ✅ Dashboard auto-refreshes

### **How to Debit User Balance**

1. **Navigate**: Admin Dashboard → **Balance Control** tab
2. **Find User**: Locate the user in the list
3. **Click**: Red **"Debit"** button
4. **Enter Amount**: e.g., $200
5. **Optional Reason**: "Fee", "Penalty", "Correction", etc.
6. **Preview**: See old balance → new balance
7. **Confirm**: Click **"Debit Account"**

**What Happens:**
```javascript
Current Balance: $1,500
Debit: -$200
─────────────────────
New Balance: $1,300
```

**System Actions:**
- ✅ User balance updated to $1,300
- ✅ Transaction created (type: "withdrawal")
- ✅ Notification sent to user
- ✅ Admin sees success toast
- ✅ Dashboard auto-refreshes

**Safety:**
- ❌ **Cannot debit more than current balance**
- ✅ System prevents negative balances
- ✅ Error shown if insufficient funds

---

## 📊 Investment Management

### **How to Add Investment**

1. **Navigate**: Admin Dashboard → **Investments** tab
2. **Find User**: Locate the user
3. **Click**: Green **"Add Investment"** button
4. **Fill Form**:
   ```
   Category: Cryptocurrency ▼
   Asset Name: Bitcoin
   Symbol: BTC (optional)
   Amount ($): 5000
   Quantity: 0.1111 (optional)
   Purchase Price ($): 45000 (optional)
   Current Price ($): 45000 (optional)
   Status: Active ▼
   Reason: "Admin added for testing" (optional)
   ```
5. **Click**: **"Add Investment"**

**What Happens:**
- ✅ New investment created in database
- ✅ Appears in user's portfolio immediately
- ✅ User receives notification
- ✅ Admin sees confirmation toast
- ✅ Investment visible in user's dashboard

**Important Notes:**
- ❌ **Does NOT deduct from user balance**
- ✅ This is **independent** of balance
- ✅ Admin can add investments without affecting balance
- ✅ Use case: Manually add external investments, corrections, bonuses

### **How to Edit Investment**

1. **Navigate**: Admin Dashboard → **Investments** tab
2. **Find User & Investment**: Locate the specific investment
3. **Click**: Pencil **"Edit"** icon
4. **Modify Fields**:
   ```
   Amount ($): Update investment amount
   Quantity: Update quantity
   Purchase Price: Update buy price
   Current Price: Update market price
   Status: Change to Active/Sold/Pending
   Reason: "Price correction" (optional)
   ```
5. **Click**: **"Update Investment"**

**What Happens:**
- ✅ Investment record updated
- ✅ User sees updated values in portfolio
- ✅ User receives notification of change
- ✅ Portfolio stats recalculate automatically

**Use Cases:**
- 📈 Update current price to reflect market
- 🔄 Change status (active → sold)
- 🛠️ Correct data entry errors
- 💹 Adjust quantities or amounts

### **How to Remove Investment**

1. **Navigate**: Admin Dashboard → **Investments** tab
2. **Find User & Investment**: Locate the investment to remove
3. **Click**: Red **"Trash"** icon
4. **Confirm**: Review investment details
5. **Optional Reason**: "Duplicate entry", "User request", etc.
6. **Click**: **"Remove Investment"**

**What Happens:**
- ✅ Investment deleted from database
- ✅ Removed from user's portfolio
- ✅ User receives notification
- ✅ Portfolio stats recalculate

**Safety:**
- ⚠️ **Permanent deletion** - cannot be undone
- ✅ Confirmation dialog prevents accidents
- ✅ Reason logged for audit trail

---

## 🔔 Automatic Notifications

All balance and investment actions automatically notify users:

### **Credit Balance**
```
"Your account has been credited with $1,000: Initial funding"
```

### **Debit Balance**
```
"Your account has been debited $200: Service fee"
```

### **Add Investment**
```
"Admin added Bitcoin investment ($5,000) to your portfolio"
```

### **Edit Investment**
```
"Admin updated your Bitcoin investment - Price correction"
```

### **Remove Investment**
```
"Admin removed your Bitcoin investment ($5,000)"
```

---

## 📝 Transaction Logging

### **Balance Adjustments**

Every credit/debit creates a transaction:

```javascript
{
  user_id: "user123",
  type: "deposit" | "withdrawal",
  amount: 1000,
  description: "Admin credit: Initial funding",
  status: "completed",
  created_at: "2025-10-20T..."
}
```

**Visible in:**
- ✅ User's transaction history
- ✅ Admin transaction management tab
- ✅ Reports and analytics

---

## 🎨 User Interface

### **Balance Control Tab**

```
┌────────────────────────────────────────────────────┐
│  💰 Balance Management                              │
│  Credit or debit user account balances             │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  John Doe                          [Active]   │  │
│  │  john@example.com                             │  │
│  │  $10,500.00                                   │  │
│  │                       [+ Credit] [- Debit]    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Jane Smith                        [Active]   │  │
│  │  jane@example.com                             │  │
│  │  $8,750.50                                    │  │
│  │                       [+ Credit] [- Debit]    │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### **Investments Tab**

```
┌────────────────────────────────────────────────────┐
│  📊 Investment Management                           │
│  Add, modify, or remove user investments           │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  John Doe                [Active]             │  │
│  │  john@example.com                             │  │
│  │  Total Invested: $15,000        [+ Add Inv]   │  │
│  │                                               │  │
│  │  🪙 Bitcoin                        [Active]   │  │
│  │     Amount: $5,000  Qty: 0.1111               │  │
│  │     Buy: $45,000  Current: $50,000            │  │
│  │                             [✏️ Edit] [🗑️ Delete] │  │
│  │                                               │  │
│  │  📈 Apple Inc.                     [Active]   │  │
│  │     Amount: $10,000  Qty: 56.18               │  │
│  │     Buy: $178  Current: $185                  │  │
│  │                             [✏️ Edit] [🗑️ Delete] │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Use Cases & Scenarios

### **Scenario 1: New User Onboarding**
```
Admin Action:
1. User completes KYC ✅
2. Admin credits $10,000 initial balance
3. User receives "Account funded" notification
4. User can start investing immediately

Result: Smooth onboarding experience
```

### **Scenario 2: Promotional Bonus**
```
Admin Action:
1. Select multiple users
2. Credit $500 to each
3. Reason: "Holiday bonus"
4. Users receive notification

Result: Happy customers! 🎉
```

### **Scenario 3: Investment Correction**
```
Admin Action:
1. User reports wrong investment amount
2. Admin edits investment
3. Update amount from $5,000 to $7,500
4. Reason: "Corrected transaction amount"
5. User sees updated portfolio

Result: Issue resolved transparently
```

### **Scenario 4: External Investment Import**
```
Admin Action:
1. User transferred from another platform
2. Admin adds existing investments:
   - Bitcoin: $15,000
   - Tesla Stock: $8,500
   - Gold: $5,000
3. Each with purchase dates and prices
4. User sees full portfolio immediately

Result: Seamless platform migration
```

### **Scenario 5: Refund Processing**
```
Admin Action:
1. User disputes a charge
2. Admin credits $250
3. Reason: "Refund for transaction #12345"
4. Transaction logged
5. User notified immediately

Result: Quick resolution, happy customer
```

---

## 🛠️ Technical Details

### **API Endpoints**

#### **Adjust Balance**
```javascript
POST /api/admin/adjust-balance

Request:
{
  userId: "user123",
  action: "credit" | "debit",
  amount: 1000,
  reason: "Initial funding" // optional
}

Response:
{
  success: true,
  action: "credit",
  amount: 1000,
  previousBalance: 500,
  newBalance: 1500,
  userName: "John Doe",
  userEmail: "john@example.com"
}
```

#### **Manage Investment**
```javascript
POST /api/admin/manage-investment

// ADD
Request:
{
  action: "add",
  userId: "user123",
  investmentData: {
    category: "crypto",
    assetName: "Bitcoin",
    assetSymbol: "BTC",
    amount: 5000,
    quantity: 0.1111,
    purchasePrice: 45000,
    currentPrice: 45000,
    status: "active",
    reason: "Admin added"
  }
}

// UPDATE
Request:
{
  action: "update",
  userId: "user123",
  investmentData: {
    investmentId: "inv-uuid",
    amount: 7500,
    currentPrice: 50000,
    status: "active",
    reason: "Price update"
  }
}

// REMOVE
Request:
{
  action: "remove",
  userId: "user123",
  investmentData: {
    investmentId: "inv-uuid"
  }
}

Response:
{
  success: true,
  action: "add" | "update" | "remove",
  investment: { /* investment object */ },
  userName: "John Doe",
  userEmail: "john@example.com"
}
```

---

## 📊 Database Schema

### **Investments Table**
```sql
investments (
  id UUID PRIMARY KEY,
  user_id TEXT,
  category TEXT,              -- crypto/stocks/forex/commodities/real_estate
  asset_name TEXT,
  amount DECIMAL(15, 2),      -- $ amount invested
  quantity DECIMAL(15, 8),    -- quantity of asset
  purchase_price DECIMAL(15, 2),
  current_price DECIMAL(15, 2),
  status TEXT,                -- active/sold/pending
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Transactions Table**
```sql
transactions (
  id UUID PRIMARY KEY,
  user_id TEXT,
  type TEXT,                  -- deposit/withdrawal/transfer
  amount DECIMAL(15, 2),
  description TEXT,           -- includes admin reason
  status TEXT,                -- completed/pending/failed
  created_at TIMESTAMP
)
```

---

## ⚡ Best Practices

### **Do's ✅**
- ✅ Always provide a reason for balance adjustments
- ✅ Double-check amounts before confirming
- ✅ Use descriptive reasons ("Refund #12345" not just "Refund")
- ✅ Verify user identity before making changes
- ✅ Keep audit logs for compliance
- ✅ Notify users of all changes

### **Don'ts ❌**
- ❌ Don't adjust balances without documentation
- ❌ Don't remove investments without user knowledge
- ❌ Don't credit/debit wrong user accounts
- ❌ Don't skip the preview step
- ❌ Don't forget to refresh dashboard after changes

---

## 🐛 Troubleshooting

### **Problem: "Insufficient balance" when debiting**
**Solution:** User doesn't have enough balance. Check current balance first.

### **Problem: Changes not showing**
**Solution:** Click anywhere or manually refresh. Dashboard auto-refreshes after actions.

### **Problem: "Admin access required" error**
**Solution:** Your email is not in the `admins` table. Contact super admin.

### **Problem: Investment not appearing**
**Solution:** Check if user is viewing the correct category tab in investments page.

### **Problem: User didn't receive notification**
**Solution:** Check notifications table. May be unread or filtered. User should check notifications page.

---

## 📱 Mobile Responsive

All admin features are **fully mobile-optimized**:
- ✅ Touch-friendly buttons
- ✅ Scrollable user lists
- ✅ Responsive dialogs
- ✅ Compact layouts for small screens
- ✅ Hidden text on mobile (icon-only buttons)

---

## 🎓 Training Tips

### **For New Admins:**

1. **Start with Balance Control**
   - Practice with test accounts
   - Use small amounts initially
   - Always include reasons

2. **Move to Investments**
   - Add a test investment
   - Edit it (change price, status)
   - Remove it
   - Check user's portfolio after each action

3. **Verify Everything**
   - Check transaction logs
   - Verify user notifications
   - Confirm balances update
   - Test both credit and debit

4. **Learn Shortcuts**
   - Tab key to navigate fields
   - Enter to submit forms
   - ESC to close dialogs

---

## 🔮 Future Enhancements

### **Planned Features:**
- 📊 Bulk balance adjustments (multiple users at once)
- 📈 Investment import from CSV
- 📅 Scheduled balance changes
- 🔄 Recurring investments setup
- 📧 Email notifications (in addition to in-app)
- 📊 Admin action analytics dashboard
- 🔍 Advanced filtering and search
- 💾 Export transaction history

---

## 📞 Support & Questions

### **For Technical Issues:**
- Check console logs for errors
- Verify API responses
- Review Supabase logs
- Test with different users

### **For Feature Requests:**
- Document the use case
- Explain business need
- Propose UI/UX flow
- Estimate impact

---

## 📝 Summary

**Admin Balance & Investment Control provides:**

✅ **Full Control** - Credit, debit, add, edit, remove  
✅ **Transparency** - All actions logged and notified  
✅ **Safety** - Confirmations, previews, validations  
✅ **Audit Trail** - Complete transaction history  
✅ **User Experience** - Automatic notifications  
✅ **Mobile-First** - Works perfectly on all devices  
✅ **Secure** - Admin-only access with verification  

**Perfect for:**
- 🎪 Customer support
- 💰 Account management
- 🛠️ Data corrections
- 🎁 Promotional campaigns
- 📊 Portfolio management
- 🔄 Platform migrations

---

**Created for CapitalPath Banking Platform**  
**Version 1.0 | October 2025**  
**Admin Control Suite | Full Balance & Investment Management**

