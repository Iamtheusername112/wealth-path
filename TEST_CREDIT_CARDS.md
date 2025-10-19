# 🧪 Test Credit Card Feature - Step by Step

## ✅ Verification Checklist

### Step 1: Verify Database Tables Exist

1. Go to Supabase Dashboard → **Table Editor**
2. Check if you see these tables:
   - ✅ `credit_card_requests`
   - ✅ `credit_cards`

If you don't see them, the SQL didn't run properly. Run `RUN_THIS_SQL_NOW.sql` again.

---

### Step 2: Test as USER

1. **Login as a regular user** (not admin)
2. Navigate to **`/cards`** page
3. You should see:
   - Gold "Request Card" button at the top
   - Or "Request Your First Card" if empty
4. **Click "Request Card"** button
5. A modal should open showing card benefits
6. **Click "Submit Request"**
7. Success screen should appear with:
   - Green checkmark ✅
   - "Request Submitted!" message
   - **"Go to Dashboard"** button (GOLD)
   - "Stay on Cards Page" button

8. Click "Stay on Cards Page"
9. You should now see a **yellow "Request Pending" notification** box

---

### Step 3: Test as ADMIN

1. **Logout from user account**
2. Go to **`/admin-login`**
3. Login with admin credentials
4. You should see:

#### In Admin Navbar (Top Right):
   - 🔔 **Bell icon with RED badge** showing "1" (if you have 1 pending request)
   - Click the bell to see dropdown:
     - "Credit Card Requests" item with count
     - Click it to go to Cards tab

#### In Main Dashboard:
   - **Gold alert box** at top saying "Credit Card Requests Pending"
   - Shows count and "Review Requests" button

5. **Click "Credit Cards" tab** (or the bell notification)
6. You should see:
   - **"Pending Card Requests"** section
   - User's request listed with:
     - User name and email
     - Request date
     - **Dropdown** to select card type (Platinum/Gold/Black)
     - Green **"Approve"** button
     - Red **"Reject"** button

---

### Step 4: Approve the Card Request

1. In the pending request:
   - **Select a card type** from dropdown:
     - Platinum ($10k) - Default
     - Gold ($20k)
     - Black ($50k)
2. **Click the green "Approve" button**
3. Wait a moment...
4. You should see:
   - ✅ Success toast notification
   - Request moves to "Request History" section
   - Status shows "approved"

---

### Step 5: Verify User Received Card

1. **Logout from admin**
2. **Login back as the user**
3. Go to **`/cards`** page
4. You should now see:
   - **Beautiful 3D metal credit card!** 💳
   - Card shows:
     - Full card number (can toggle show/hide with eye icon)
     - Cardholder name (UPPERCASE)
     - Expiry date
     - CVV (hidden by default)
     - Card type badge (Platinum/Gold/Black)
     - Credit limit
     - Available credit
   - **"Go to Dashboard" button** at the bottom (GOLD)

5. Test card features:
   - Click **eye icon** to show/hide card details
   - Click **card number** to copy it
   - Click **CVV** to copy it

6. Check **`/notifications`** page:
   - Should have a notification saying card was approved

---

## 🐛 Troubleshooting

### Issue: Can't see "Credit Cards" tab in admin dashboard
**Solution:** 
- Make sure you've run the latest SQL schema
- Refresh the admin page (F5)
- Check browser console for errors

### Issue: Approve button doesn't work
**Solution:**
- Open browser console (F12)
- Look for errors
- Check if tables exist in Supabase
- Verify user's KYC status is "approved"

### Issue: User can't request card
**Possible reasons:**
- KYC not approved → Check user's kyc_status in database
- Already has a card → Check credit_cards table
- Already has pending request → Check credit_card_requests table

### Issue: Card not displaying after approval
**Solution:**
- Refresh the `/cards` page
- Check credit_cards table in Supabase
- Look for the user's card record
- Check browser console for API errors

---

## 📊 Expected Database Records

After approving a card, you should see:

### In `credit_card_requests` table:
```
| user_id | status   | requested_at | processed_at |
|---------|----------|--------------|--------------|
| user123 | approved | 2025-10-19   | 2025-10-19   |
```

### In `credit_cards` table:
```
| user_id | card_number        | card_type | status | credit_limit |
|---------|-------------------|-----------|--------|--------------|
| user123 | 5234 1234 5678... | platinum  | active | 10000.00     |
```

---

## ✨ Success Indicators

You know it's working when:
- ✅ Bell notification shows pending count
- ✅ Admin sees card requests in Cards tab
- ✅ Admin can select card type and approve
- ✅ User receives notification after approval
- ✅ User sees beautiful 3D card on Cards page
- ✅ Card details can be shown/hidden
- ✅ Card numbers can be copied

---

**If all steps work, the feature is 100% functional!** 🎉

