# MedTrack: Cost-Effective Hybrid Architecture Plan

Your approach is very reasonable and aligns well with your budget and scalability needs. Here's a deep-dive analysis and recommendations for each part of your proposed architecture, with cost, scalability, and developer experience in mind:

---

## 1. **Frontend Hosting (Vercel/Netlify)**
- **Vercel** and **Netlify** both offer generous free tiers and are perfect for hosting static frontends (React, Vue, etc.).
- **Recommendation:** Use either; Vercel is slightly more popular for React/Vite projects, but both are excellent.

---

## 2. **Authentication (Supabase Free Plan)**
- Supabase Auth is robust, easy to integrate, and the free plan is generous for early-stage projects.
- **Caveat:** As you noted, free plan emails are branded. You can use Supabase Auth but disable their email templates and send your own emails (see below).
- **Alternative:** Firebase Auth (also free, but similar branding issues), or Auth0 (free up to 7,000 users, but can get expensive).

---

## 3. **File Storage (Wasabi)**
- Wasabi is a great, cost-effective S3-compatible storage provider. $5.99/month for 1TB, no egress fees for most use cases.
- **Integration:** Use their SDK or S3-compatible libraries in Node.js.
- **Alternative:** Backblaze B2 (similar pricing), or Cloudflare R2 (no egress to Cloudflare Workers).

---

## 4. **Backend/API (Node.js on Oracle Cloud ARM VM)**
- Oracle Cloud's ARM VMs (Always Free) are a fantastic option for a backend server. You get 4 OCPUs and 24GB RAM for free.
- **Deployment:** Use Docker or PM2 to run your Node.js API.
- **Alternative:** Hetzner, Contabo, or Scaleway for low-cost VMs if Oracle is not available.

---

## 5. **Database (Cheap, Large Capacity)**
- **Supabase/Neon:** Both are managed Postgres, but Neon is expensive for large storage.
- **Alternatives:**
  - **Self-hosted Postgres** on your Oracle VM: Free, only pay for storage. You can easily scale storage by attaching block volumes.
  - **YugabyteDB** or **CockroachDB**: Distributed SQL, but more complex to manage.
  - **PlanetScale**: MySQL-compatible, generous free tier, but not as feature-rich as Postgres.
  - **MongoDB Atlas**: Free tier, but limited storage; self-hosted MongoDB is an option.
- **Recommendation:** Start with self-hosted Postgres on your Oracle VM. It's free, scalable, and you control the storage.

---

## 6. **Realtime Notifications (Firebase, Pusher, Ably)**
- **Firebase Cloud Messaging (FCM):** Free, reliable, works for web and mobile push.
- **Pusher/Ably:** Both have free tiers, but can get expensive with scale.
- **Recommendation:** Use Firebase Cloud Messaging for push notifications. For in-app realtime (e.g., chat), consider Pusher/Ably if you need WebSockets, but for most medical tracking, FCM is enough.

---

## 7. **Email Service (No Supabase Branding)**
- **Options:**
  - **Resend**: Modern, developer-friendly, free for 3,000 emails/month, no branding.
  - **Mailgun**: 5,000 free emails/month for 3 months, then pay-as-you-go.
  - **SendGrid**: 100 emails/day free, no branding.
  - **Postmark**: $15/month for 10,000 emails, but very high deliverability.
- **Recommendation:** Use Resend or SendGrid for transactional emails (password reset, verification, etc.). Integrate with your Node.js backend.

---

## 8. **Hybrid Auth Flow**
- Use Supabase Auth for user management (sign up, sign in, password reset).
- On sign-up/sign-in, use Supabase's webhooks or client SDK to trigger your own backend logic if needed.
- For email, disable Supabase's built-in emails and send your own via your backend and chosen email provider.

---

## 9. **Scalability & Migration**
- As you grow, you can:
  - Move the database to a managed service if self-hosting becomes a bottleneck.
  - Upgrade your Oracle VM or move to another provider.
  - Use a CDN (Cloudflare) for static assets.

---

## 10. **Native Apps (iOS/Android)**
- Your backend and auth choices (Supabase, Node.js, Firebase) all have SDKs for mobile.
- You can reuse most of your logic and API endpoints.

---

## **Summary Table**

| Component         | Service/Provider         | Cost (est.) | Notes                                    |
|-------------------|-------------------------|-------------|------------------------------------------|
| Frontend          | Vercel/Netlify          | Free        | Static hosting, easy CI/CD               |
| Auth              | Supabase (Free)         | Free        | Use custom email for branding            |
| File Storage      | Wasabi                  | $5.99/mo    | 1TB, S3-compatible                       |
| Backend/API       | Oracle Cloud ARM VM     | Free        | 4 OCPU, 24GB RAM, self-hosted Node.js    |
| Database          | Self-hosted Postgres    | Free        | On Oracle VM, pay for extra storage only |
| Realtime/Push     | Firebase Cloud Messaging| Free        | Web/mobile push, no cost                 |
| Email             | Resend/SendGrid         | Free/cheap  | No branding, easy integration            |

---

## **Next Steps**

1. **Set up Oracle Cloud VM** and install Docker, Node.js, and Postgres.
2. **Migrate your backend logic** from Supabase functions to Node.js API.
3. **Integrate Wasabi** for file uploads/downloads.
4. **Configure Supabase Auth** for user management, but handle emails via your backend.
5. **Set up Firebase Cloud Messaging** for notifications.
6. **Deploy frontend** to Vercel/Netlify.
7. **Test end-to-end** and optimize for cost and performance.

---

## Environment Variables

Create a `.env` (or `.env.local`) file in the project root and define the variables below. Each variable is optional—sensible defaults are provided for local development—but **production builds must have real values**.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Base URL for the Node/Express REST API. | `http://localhost:4000/api` |
| `VITE_SUPABASE_URL` | Supabase project URL (used only for authentication). | – |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key. | – |
| `VITE_WASABI_ENDPOINT` | Wasabi/MinIO S3-compatible endpoint for file uploads. | – |
| `VITE_WASABI_BUCKET` | Default S3 bucket name for uploads. | – |
| `VITE_WASABI_ACCESS_KEY` | S3 access key. | – |
| `VITE_WASABI_SECRET_KEY` | S3 secret key. | – |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, ... | Firebase config values for Cloud Messaging push notifications. | – |

> Only variables prefixed with `VITE_` are exposed to the browser. Do **not** include secrets that should remain server-side.

### Development Scripts

---

### **Let me know if you want a detailed migration plan, code samples for any integration, or help with any specific part of this stack!**
