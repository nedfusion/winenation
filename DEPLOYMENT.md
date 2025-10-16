# WineNation Deployment Guide for cPanel

This guide will walk you through deploying your WineNation website to cPanel hosting.

## Prerequisites

Before starting, make sure you have:
- Access to your cPanel hosting account
- Your Supabase project URL and API keys
- A GitHub account
- Git installed on your local machine (if deploying from local)

## Step 1: Push Your Code to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a New Repository on GitHub**:
   - Go to https://github.com/new
   - Create a new repository (e.g., "winenation-store")
   - Do NOT initialize with README (since you already have code)

3. **Push Your Code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Build Your Production Files

Before deploying, you need to build your production files:

```bash
npm install
npm run build
```

This creates a `dist` folder with all your production-ready files.

## Step 3: Deploy to cPanel

### Option A: Using cPanel File Manager (Recommended for Beginners)

1. **Log in to cPanel**
   - Go to your hosting provider's cPanel login page
   - Enter your credentials

2. **Navigate to File Manager**
   - Find and click on "File Manager" in cPanel
   - Navigate to `public_html` (or your domain's root directory)

3. **Upload Your Built Files**
   - Open the `dist` folder from your local project
   - Select all files inside the `dist` folder
   - Upload them to your `public_html` directory
   - **Important**: Upload the CONTENTS of the dist folder, not the dist folder itself

4. **Configure Environment Variables**
   - In cPanel, go to "File Manager"
   - Create a new file called `.htaccess` in your public_html directory (if it doesn't exist)
   - Add the following content:

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

5. **Set Up Environment Variables**
   - You'll need to embed your Supabase credentials in the JavaScript files
   - **Security Note**: Since this is a client-side app, your ANON key is meant to be public
   - Your environment variables are already bundled in the build

### Option B: Using Git Integration in cPanel (Advanced)

Some cPanel installations support Git deployment:

1. **Access Git Version Control**
   - In cPanel, find "Git Version Control"
   - Click "Create"

2. **Clone Repository**
   - Enter your GitHub repository URL
   - Set the repository path (e.g., `/home/username/repositories/winenation`)
   - Enter your GitHub credentials

3. **Deploy Files**
   - After cloning, you'll need SSH access or cPanel Terminal
   - Run the build commands:
     ```bash
     cd /home/username/repositories/winenation
     npm install
     npm run build
     cp -r dist/* /home/username/public_html/
     ```

### Option C: Using FTP (Alternative)

1. **Get FTP Credentials**
   - In cPanel, go to "FTP Accounts"
   - Use your main cPanel account or create a new FTP account

2. **Connect via FTP Client**
   - Download an FTP client (like FileZilla)
   - Connect using your credentials
   - Navigate to `public_html`

3. **Upload Built Files**
   - Upload all files from your local `dist` folder
   - Upload them to the `public_html` directory

## Step 4: Verify Your Deployment

1. **Test Your Website**
   - Visit your domain (e.g., https://yourdomain.com)
   - Check that the homepage loads correctly
   - Test navigation between pages
   - Verify that product images load

2. **Test Database Connection**
   - Try signing in or creating an account
   - Add products to cart
   - Check admin panel functionality

3. **Check Browser Console**
   - Open browser developer tools (F12)
   - Look for any errors in the Console tab
   - Verify API calls to Supabase are working

## Important Files Structure

After deployment, your cPanel public_html should contain:

```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (other asset files)
├── WINENATION Logo.jpg
├── winenation video.mp4
└── .htaccess
```

## Troubleshooting

### Issue: Blank Page or 404 Errors

**Solution**: Make sure your `.htaccess` file is configured correctly (see Step 3.4 above)

### Issue: Images Not Loading

**Solution**:
- Check that image files are uploaded to the correct directory
- Verify image URLs in your product database
- Check Supabase Storage bucket permissions

### Issue: Database Connection Errors

**Solution**:
- Verify your Supabase project URL and API key
- Check Supabase project is active and not paused
- Verify RLS (Row Level Security) policies are set correctly

### Issue: Admin Panel Not Accessible

**Solution**:
- Ensure you've created an admin user in Supabase
- Check that the user's `is_admin` field is set to `true` in the profiles table

## Updating Your Website

When you need to update your website:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

3. Rebuild your project:
   ```bash
   npm run build
   ```

4. Upload the new `dist` folder contents to cPanel (replacing old files)

## Security Notes

- Your `.env` file is NOT uploaded to GitHub (it's in .gitignore)
- The Supabase ANON key is safe to expose in client-side code
- NEVER expose your Supabase SERVICE_ROLE_KEY in client-side code
- Make sure your cPanel account has a strong password
- Enable HTTPS/SSL certificate in cPanel for secure connections

## Need Help?

If you encounter issues:
- Check cPanel error logs (in "Errors" section)
- Review browser console for JavaScript errors
- Verify Supabase dashboard for API errors
- Contact your hosting provider's support team

## Additional Recommendations

1. **Enable SSL Certificate**
   - In cPanel, go to "SSL/TLS Status"
   - Enable AutoSSL for your domain

2. **Set Up Backups**
   - Use cPanel's backup tools
   - Keep regular backups of your database

3. **Monitor Performance**
   - Use cPanel's metrics tools
   - Monitor Supabase usage and limits

4. **Optimize Images**
   - Compress product images before uploading
   - Use WebP format for better performance
