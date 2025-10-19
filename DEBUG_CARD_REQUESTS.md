# 🔍 Debug Credit Card Requests - Step by Step

## Step 1: Fix Database Schema Issue

The `processed_by` field was referencing a table that might not exist. Run this SQL to fix it:

```sql
-- Fix the processed_by field
ALTER TABLE credit_card_requests 
ALTER COLUMN processed_by TYPE TEXT;

ALTER TABLE credit_card_requests 
ALTER COLUMN processed_by DROP NOT NULL;
```

Or simply re-run the updated `RUN_THIS_SQL_NOW.sql` file.

---

## Step 2: Check if Requests Exist in Database

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `credit_card_requests` table
3. Check if you see any rows with `status = 'pending'`

### If you see rows:
✅ Requests exist! Problem is with the admin API/UI.

### If you don't see rows:
❌ The user's request didn't save. Go to Step 3.

---

## Step 3: Check Browser Console for Errors

### As Admin:
1. Open the admin dashboard
2. Press **F12** to open developer console
3. Click on **Credit Cards** tab
4. Look for logs in the console:

**Expected logs:**
```
✅ Fetched credit card requests: 1 requests
📋 Requests data: [...]
Card requests response: {...}
Setting requests: [...]
```

**If you see errors:**
```
❌ Error fetching card requests: {...}
```
Copy the error message and check what it says.

---

## Step 4: Manual Test - Create a Request Directly

Let's manually insert a test request in Supabase:

1. Go to **Supabase** → **SQL Editor**
2. Run this SQL (replace `YOUR_USER_ID` with actual user ID):

```sql
INSERT INTO credit_card_requests (user_id, status, requested_at)
VALUES ('YOUR_USER_ID', 'pending', NOW());
```

3. Refresh admin dashboard → Click **Credit Cards** tab
4. Should now see 1 pending request

---

## Step 5: Verify User Exists

The requests query joins with the `users` table. Make sure:

1. Go to **Supabase** → **Table Editor** → `users`
2. Find the user who requested the card
3. Copy their `id`
4. Go to `credit_card_requests` table
5. Make sure the `user_id` matches exactly

---

## Step 6: Test the API Directly

Open a new browser tab and go to:
```
https://your-app.vercel.app/api/admin/card-requests
```

or if running locally:
```
http://localhost:3000/api/admin/card-requests
```

**Expected response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "...",
      "user_id": "...",
      "status": "pending",
      "users": {
        "id": "...",
        "email": "...",
        "full_name": "...",
        "kyc_status": "..."
      }
    }
  ]
}
```

**If you get "Unauthorized":**
- You're not logged in as admin
- Cookie `admin_token` is missing or wrong

---

## Common Issues & Solutions

### Issue: "No pending card requests" but data exists in database
**Solution:**
- Check browser console for API errors
- Verify admin authentication cookie exists
- Check if API endpoint is returning data

### Issue: API returns empty array
**Solution:**
- Check if `users` table has matching user
- Verify `user_id` in requests matches users table
- Check for SQL errors in server logs

### Issue: "Unauthorized" error
**Solution:**
- Make sure you're logged in as admin at `/admin-login`
- Check if cookie `admin_token = 'admin_authenticated'` exists
- Try logging out and back in

---

## Quick Fix Commands

### Reset and test fresh:

1. **Delete all existing requests:**
```sql
DELETE FROM credit_card_requests;
```

2. **Delete all existing cards:**
```sql
DELETE FROM credit_cards;
```

3. **As user:** Request a new card
4. **Check database:** Verify request exists
5. **As admin:** Check Cards tab

---

## What to Share if Still Not Working

If it's still not working, share these details:

1. **Console logs** from Step 3
2. **API response** from Step 6
3. **Database screenshot** showing credit_card_requests table
4. **Any error messages** in red

This will help identify exactly where the issue is!

