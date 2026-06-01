# Security Specification: Tu Negocio RD Firebase Access Controls

## 1. Data Invariants

- **User Profiles (`/users/{userId}`)**:
  - A user can only read and write their own profile document (`request.auth.uid == userId`).
  - Upon creation of a profile, the client cannot declare itself as initially PRO or admin without restriction. However, in our billing app, the user can upgrade by adding a payment method.
  - Verification check: `request.auth.token.email_verified == true`.
  - Timestamps are validated matching `request.time`.

- **Payment Methods (`/users/{userId}/paymentMethods/{methodId}`)**:
  - Restricts get, list, create, and delete strictly to the authenticated owner (`request.auth.uid == userId`).
  - Enforces correct card formats and string max limits to prevent Denise of Wallet attacks or resource database poisoning.

---

## 2. The "Dirty Dozen" Threat Model Payloads

1. **User Identity Spoofing**: Attempting to write profile data to `users/different_user_id` where `request.auth.uid` is different. (Result: `PERMISSION_DENIED`)
2. **Untrusted Email Registration**: Attempting to sign up or update details with `email_verified: false` bypass. (Result: `PERMISSION_DENIED`)
3. **Ghost Role Injection**: Registering or updating with custom injected keys (e.g. `role: 'ADMIN_GOD'`) outside enum. (Result: `PERMISSION_DENIED`)
4. **ID Poisoning Attack**: Attempting to create a payment method with a huge ID string structure (e.g., character overflow > 128 chars). (Result: `PERMISSION_DENIED`)
5. **PII Blanket Scraping**: Triggering a broad query on all `users` or other personal payment collections without a per-user where clause filter. (Result: `PERMISSION_DENIED`)
6. **Temporal Spoofing**: Setting `updatedAt` to a past or future date instead of Firestore `request.time`. (Result: `PERMISSION_DENIED`)
7. **Cross-User Card Injection**: Authenticated user `user_A` writing a payment card into `users/user_B/paymentMethods/card_123`. (Result: `PERMISSION_DENIED`)
8. **Malicious Empty Fields**: Submitting empty strings or fields containing blank records. (Result: `PERMISSION_DENIED`)
9. **Card Brand Abuse**: Setting card brand to non-supported arbitrary string `unlimited_card`. (Result: `PERMISSION_DENIED`)
10. **Card Expiry Attack**: Forcing incorrect format like `MM/YYYY` or text strings for card expiry. (Result: `PERMISSION_DENIED`)
11. **Last4 Spoof**: Inserting generic length or alpha-numeric characters inside `last4` instead of 4 strict digits. (Result: `PERMISSION_DENIED`)
12. **Foreign Account Read**: Attempting to query or read card details of another user's sub-collection. (Result: `PERMISSION_DENIED`)
