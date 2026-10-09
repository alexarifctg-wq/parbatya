# PARBATYA TRAVELS BD (Phase 1, step 1)

## Run
1. `cp .env.example .env`
2. `npm install`
3. `npm run db:up`
4. `npm run db:migrate`  (name the migration "init")
5. `npm run db:seed`     (8 divisions, 64 districts, all 500 upazilas from database/data/bd-locations.json, one sample product)
6. `npm run backend:dev`, then open http://localhost:4000/api/divisions

## Frontend
`npm run dev -w frontend` (needs the backend running). Set `NEXT_PUBLIC_API_URL` if the API is not on localhost:4000.

## Auth
`POST /api/auth/register`, `POST /api/auth/login` return a JWT. Send `Authorization: Bearer <token>`.
`GET /api/orders/me` is My Orders. `/api/admin/*` needs role ADMIN: register a user, then set `role = 'ADMIN'` in the database.

## Next modules
Frontend (Next.js homepage), tourism spot admin, product API, cart, checkout.

## Notes
- Prices are integer paisa.
- Upazila slugs are `district-upazila` (names repeat across districts). "Dhaka City" and "Chattogram City" were added as extra entries for the city areas.
- Guest checkout is temporary; auth, My Orders and admin endpoints come next. Cart is client-side for now (prices are re-checked on the server).

## Events, booking and certificates
- Events are not in the cart. `POST /api/event-bookings` reserves seats and records a payment of at least 30% of the total (the server enforces it). The receipt is valid once the payment is confirmed (gateway webhook; `POST /api/admin/event-payments/:receiptNo/confirm` is the placeholder).
- The balance is paid with `POST /api/event-bookings/:id/pay`. Each payment gets its own receipt: `GET /api/receipts/:receiptNo`.
- `GET /api/events?when=ongoing|upcoming|completed`.
- Admin marks attendance (`PATCH /api/admin/event-bookings/:id/attended`), then after the event ends calls `POST /api/admin/events/:id/issue-certificates` (fully paid and attended only).
- `GET /api/certificates/me` and the public `GET /api/certificates/verify/:code`.
- PDFs: `GET /api/receipts/:no/pdf` and `GET /api/certificates/:code/pdf` (company name on every page; Latin text only until a Bengali font is registered in `pdf.service.ts`).
- Not built yet: the Unseen Bangladesh certificate PDF on the server, releasing seats when an unpaid booking expires, the real payment gateway.
- WhatsApp button: set `NEXT_PUBLIC_WHATSAPP_NUMBER` in the frontend environment.

## Menu switches and social links
- `GET /api/settings` returns `{ nav, social }`. `nav` says which menu items to show (Explore, Journeys and Stories start hidden); `social` holds the Facebook, YouTube, Instagram and WhatsApp links (empty links show a greyed icon).
- Admin changes them with `PUT /api/admin/settings/nav` or `/social` and body `{ "value": { ... } }`. The admin screen for this is not built yet; the website prototype reads the same names from a `FEATURES` and `SOCIAL` block at the top of its script.

## Trip inquiries and reviews
- `POST /api/trip-inquiries` saves a lead from the home search (place, people, date). Admin reads them at `GET /api/admin/trip-inquiries` and marks `PATCH .../:id/contacted`.
- `POST /api/reviews` works only for a signed-in user with at least one non-cancelled order, a paid event booking or a confirmed tour booking. New reviews start as PENDING; admin approves with `PATCH /api/admin/reviews/:id` and `{ "status": "APPROVED" }`. `GET /api/reviews?target=SITE` returns approved ones for the "Happy customers" section.
- The website prototype does not call these yet.
