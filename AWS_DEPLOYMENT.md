# ☁️ AWS Amplify Deployment Guide

This guide will help you deploy your **Aether Market** app to AWS Amplify. Amplify is perfect for Next.js apps because it handles hosting, SSL, and CI/CD automatically.

## Prerequisites

1.  **GitHub Repo**: Ensure your latest code (including `amplify.yml`) is pushed to GitHub.
2.  **AWS Account**: Login to the [AWS Console](https://console.aws.amazon.com/).

## Step 1: Create Amplify App

1.  Go to the **[AWS Amplify Console](https://console.aws.amazon.com/amplify/home)**.
2.  Click **"Create new app"** (or "Get started").
3.  Select **"GitHub"** as your existing code source and click **Next**.
4.  Authorize AWS Amplify to access your GitHub account if prompted.
5.  Select your repository (`mardromus/NeuralGrid`) and the branch (e.g., `main`).
6.  Click **Next**.

## Step 2: Build Settings

Amplify should automatically detect your settings because we added `amplify.yml`.

1.  **App name**: Enter `aether-market` (or whatever you prefer).
2.  **Build settings**: It need to autodect the `amplify.yml` file from the repository.
    *   If it doesn't, click "Edit" and copy-paste the content of `amplify.yml`.
3.  **Environment Variables**: You **MUST** add these here. Click "Advanced settings" -> "Environment variables".

    | Key | Value |
    | :--- | :--- |
    | `NEXT_PUBLIC_APTOS_NETWORK` | `testnet` (or `mainnet`) |
    | `NEXT_PUBLIC_PAYMENT_RECIPIENT` | *[Your 0x... Wallet Address]* |
    | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *[Your Google Client ID]* |
    | `GROQ_API_KEY` | *[Your Groq API Key]* |

    > **Note**: Do NOT wrap values in quotes.

4.  Click **Next**.
5.  Review everything and click **Save and deploy**.

## Step 3: Wait & Verify

1.  Amplify will start the "Provision", "Build", "Deploy", and "Verify" stages.
2.  Wait for all green checks (approx 3-5 mins).
3.  Once done, click the **Domain URL** provided by Amplify (e.g., `https://main.d12345.amplifyapp.com`) to test your live site.

## Step 4: Post-Deployment (Google Auth Fix)

Just like with Vercel, you must update Google Cloud Console because your domain has changed.

1.  Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2.  Edit your OAuth 2.0 Client.
3.  **Authorized JavaScript origins**: Add your new Amplify domain.
4.  **Authorized redirect URIs**: Add your new Amplify domain.
5.  Save.

---

### Troubleshooting

- **Build Fails?** Click on the "Build" step in Amplify to see the logs.
- **Login Issues?** Double-check Step 4. It takes a few minutes for Google to propagate changes.
