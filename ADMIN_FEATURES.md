# Admin Dashboard - Fixed Features

## Changes Made

### 1. User Creation Fixed
- **Issue**: Super Admin could not add new admin users due to RLS policies
- **Solution**: Created Edge Function `create-admin-user` that uses service role to bypass RLS
- **Location**: Deployed to Supabase Edge Functions (verify_jwt: true)

### 2. Login/Logout Buttons Added
- **Admin Dashboard** now has:
  - Red "Logout" button in top-right corner
  - Gray "Back to Store" button to return to shop
  - User email display showing who's logged in
  - Admin role badge

- **Main Store Header** has:
  - User icon with dropdown menu
  - Sign Out option
  - Admin Dashboard link (for admins only)

## How to Use

### For Super Admins:

1. **Login**:
   - Go to `/admin/login`
   - Enter your super admin credentials
   - Click "Sign In"

2. **Add New Admin Users**:
   - Navigate to the "Users" tab
   - Click "Add Admin User" button (red, top-right)
   - Fill in the form:
     - Full Name
     - Email
     - Password (min 6 characters)
     - Admin Role (Super Admin, Product Manager, Order Manager, or Viewer)
   - Click "Add User"

3. **Manage Existing Users**:
   - Click "Make Admin" to promote customers
   - Click "Remove Admin" to demote admins
   - Click on an admin's role to change it

4. **Logout**:
   - Click the red "Logout" button in top-right
   - Or use the user menu in main store header

### For Regular Users:

1. **Login/Signup**:
   - Click "Sign In" or "Sign Up" in header
   - Fill in credentials
   - Access the store

2. **Logout**:
   - Click user icon in header
   - Select "Sign Out" from dropdown

## Technical Details

### Edge Function: create-admin-user
- **Endpoint**: `${SUPABASE_URL}/functions/v1/create-admin-user`
- **Method**: POST
- **Authentication**: Requires Bearer token (JWT)
- **Authorization**: Only Super Admins can call this function
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "securepassword",
    "fullName": "John Doe",
    "adminRole": "product_manager"
  }
  ```

### Admin Roles
- **super_admin**: Full access to all features
- **product_manager**: Manage products and stock
- **order_manager**: Manage orders
- **viewer**: View-only access

## Troubleshooting

### If you don't see the logout button:
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors

### If user creation fails:
1. Verify you're logged in as Super Admin
2. Check browser console for error messages
3. Verify the edge function is deployed (check Supabase dashboard)

## Build Information
- Last Build: Successfully completed
- Assets Generated: ✓
- Edge Functions Deployed: ✓
  - create-admin-user (ACTIVE)
  - create-super-admin (ACTIVE)
  - transactpay-webhook (ACTIVE)
