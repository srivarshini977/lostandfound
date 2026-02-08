# How to Get Clerk API Keys

1.  **Log in to Clerk**: Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in.
2.  **Create Application**:
    *   Click **"Create application"**.
    *   Name it (e.g., "Campus Lost & Found").
    *   Select the **"Email"** and **"Google"** (optional) authentication providers.
    *   Click **"Create application"**.
3.  **Get Keys**:
    *   You will be redirected to the **API Keys** page immediately after creation.
    *   If not, look for **"API Keys"** in the left sidebar (under the "Developers" section).
4.  **Copy Values**:
    *   Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_...`).
    *   Copy the `CLERK_SECRET_KEY` (starts with `sk_test_...`).
5.  **Paste in `.env.local`**:
    *   Open your project's `.env.local` file.
    *   Paste the keys into the corresponding fields.

## Important Settings for this Project
Since you want to restrict to `.edu` emails only:
1.  Go to **"User & Authentication"** > **"Email, Phone, Username"**.
2.  Ensure **"Email address"** is required.
3.  (Optional) For strict restriction, you can try to find "Restrictions" or "Allowlist/Blocklist" settings in "Configure" > "Restrictions" to allow only `*.edu` domains. **However**, we will also enforce this in our code to be safe.
