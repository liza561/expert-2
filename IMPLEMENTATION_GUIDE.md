# Implementation Guide - Expert Advisor Platform

## Setup Instructions

### 1. Update Convex Configuration

The Convex schema has been updated with all new tables. Push the schema to Convex:

```bash
npx convex push
```

This will:
- Create all new database tables
- Set up indexes for efficient queries
- Deploy all mutations and queries

### 2. Install Dependencies (if needed)

All required dependencies are already in package.json:
```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pk
```

## File Structure

```
project/
├── convex/
│   ├── schema.ts              # Updated with all tables
│   ├── users.ts               # Updated with role support
│   ├── advisorProfiles.ts      # NEW
│   ├── wallet.ts              # NEW
│   ├── sessions.ts            # NEW
│   ├── earnings.ts            # NEW
│   ├── documents.ts           # NEW
│   ├── disputes.ts            # NEW
│   ├── payouts.ts             # NEW
│
├── components/
│   ├── AdvisorProfileSetup.tsx # NEW - Advisor onboarding
│   ├── SessionTimer.tsx        # NEW - Real-time session display
│   ├── Wallet.tsx             # NEW - Wallet UI
│   ├── AdvisorEarnings.tsx     # NEW - Earnings dashboard
│   ├── SessionRating.tsx       # NEW - Post-session rating
│   ├── SessionDispute.tsx      # NEW - Dispute reporting
│   ├── AdminDashboard.tsx      # NEW - Admin panel
│
├── app/api/
│   ├── sessions/
│   │   ├── start/route.ts      # NEW
│   │   ├── end/route.ts        # NEW
│   │   └── pause/route.ts      # NEW
│   ├── advisor/
│   │   ├── profile/route.ts    # NEW
│   │   ├── earnings/route.ts   # NEW
│   │   └── payouts/route.ts    # NEW
│   ├── admin/
│   │   ├── stats/route.ts      # NEW
│   │   ├── sessions/route.ts   # NEW
│   │   └── disputes/route.ts   # NEW
│
├── lib/
│   ├── billingEngine.ts        # NEW - Billing calculations
│   ├── billingService.ts       # NEW - Real-time per-minute billing
│   ├── rolePermissions.ts      # NEW - Role-based access control
│   ├── sessionUtils.ts         # NEW - Session utilities
│
└── BILLING_SYSTEM_DOCS.md      # NEW - Complete documentation
```

## Implementation Steps

### Step 1: Update User Management

The user creation flow now includes role assignment:

```typescript
// In your user sync component
await upsertUser({
  userId,
  name,
  email,
  imageURL,
  role: "client" // or "advisor", "admin"
});
```

### Step 2: Create Advisor Profile Setup

1. Add a new page for advisor onboarding:
```
app/advisor/setup/page.tsx
```

2. Import and use the component:
```typescript
import AdvisorProfileSetup from "@/components/AdvisorProfileSetup";

export default function AdvisorSetupPage() {
  return <AdvisorProfileSetup userId={userId} onComplete={() => {}} />;
}
```

### Step 3: Implement Session Initiation

Create a session start component:

```typescript
import SessionTimer from "@/components/SessionTimer";
import { useBillingSession } from "@/lib/billingService";

export default function ChatSession() {
  const { pause, resume, end } = useBillingSession(
    sessionId,
    clientId,
    advisorId,
    pricePerMinute,
    (type) => console.log("Warning:", type),
    () => console.log("Paused"),
    (data) => console.log("Update:", data)
  );

  return <SessionTimer {...sessionProps} />;
}
```

### Step 4: Add Wallet Management

Add wallet component to client dashboard:

```typescript
import Wallet from "@/components/Wallet";

export default function ClientDashboard() {
  return <Wallet userId={userId} />;
}
```

### Step 5: Add Advisor Earnings Dashboard

Add to advisor dashboard:

```typescript
import AdvisorEarnings from "@/components/AdvisorEarnings";

export default function AdvisorDashboard() {
  return <AdvisorEarnings advisorId={advisorId} />;
}
```

### Step 6: Add Admin Panel

Create admin page:

```typescript
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return <AdminDashboard />;
}
```

## Integration with Stream Chat/Video

### Chat Integration

For Stream Chat sessions:

```typescript
import { useBillingSession } from "@/lib/billingService";

export default function ChatSession() {
  const { pause, resume, end } = useBillingSession(
    sessionId,
    clientId,
    advisorId,
    chatPricePerMinute
  );

  return (
    <div>
      <ChatUI />
      <SessionTimer pricePerMinute={chatPricePerMinute} />
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={() => end(duration, totalCharged)}>End</button>
    </div>
  );
}
```

### Video Integration

For Stream Video calls:

```typescript
import { useBillingSession } from "@/lib/billingService";

export default function VideoCall() {
  const { pause, resume, end } = useBillingSession(
    sessionId,
    clientId,
    advisorId,
    videoPricePerMinute,
    onWarning,
    onPaused
  );

  return (
    <div>
      <StreamVideo />
      <SessionTimer pricePerMinute={videoPricePerMinute} />
    </div>
  );
}
```

## Wallet Flow

### Client Adding Funds

```
1. Client clicks "Add Funds" in Wallet component
2. Enters amount and payment method
3. Payment processed (integrate with Stripe/PayPal)
4. Funds added to wallet via addFunds mutation
5. Transaction recorded automatically
```

### Session Billing

```
1. Session starts - user balance checked
2. Every second - costPerSecond deducted
3. Warnings triggered at thresholds
4. Session auto-pauses at zero balance
5. Session ending creates earnings record
```

### Advisor Withdrawal

```
1. Advisor views AdvisorEarnings component
2. Clicks "Request Withdrawal"
3. Enters bank details
4. Request stored (status: pending)
5. Admin approves in admin panel
6. Status updated to completed
```

## Billing Calculations

### Cost Per Second
```
costPerSecond = pricePerMinute / 60
```

### Total Session Charge
```
totalCharged = (durationSeconds / 60) * pricePerMinute
```

### Advisor Earning
```
advisorEarning = totalCharged * 0.9  // 10% platform fee
platformFee = totalCharged * 0.1
```

### Remaining Balance Warning
```
minutesRemaining = balance / pricePerMinute

if (minutesRemaining <= 1) → show "1-minute warning"
if (minutesRemaining <= 2) → show "2-minute warning"
if (minutesRemaining <= 0) → auto-pause session
```

## API Usage Examples

### Start Session
```bash
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "clientId": "client1",
    "advisorId": "advisor1",
    "type": "chat",
    "pricePerMinute": 0.50
  }'
```

### End Session
```bash
curl -X POST http://localhost:3000/api/sessions/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "durationSeconds": 1200,
    "totalCharged": 10.00,
    "clientWalletAfter": 45.50,
    "advisorEarning": 9.00
  }'
```

### Add Wallet Funds
```bash
curl -X POST http://localhost:3000/api/wallet/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client1",
    "amount": 50.00,
    "description": "Wallet recharge"
  }'
```

## Security Checklist

- [ ] Verify user authentication on all endpoints
- [ ] Check user role before billing operations
- [ ] Validate amount inputs (no negative or zero)
- [ ] Ensure wallet balance verified before deduction
- [ ] Implement rate limiting on billing endpoint
- [ ] Validate session ownership before operations
- [ ] Sanitize all user inputs
- [ ] Log all financial transactions
- [ ] Implement audit trail for admin actions
- [ ] Regular database backups

## Testing Guide

### Unit Tests

Test billing calculations:
```typescript
// Test cost calculation
const cost = (60 / 60) * 0.50; // Should be 0.50
expect(cost).toBe(0.50);
```

### Integration Tests

Test full session flow:
```typescript
1. Create user with role
2. Setup advisor profile
3. Add funds to wallet
4. Start session
5. Verify deductions every second
6. End session
7. Verify receipt accuracy
8. Check earnings recorded
```

### E2E Tests

Full user journey:
```
1. Advisor completes profile
2. Client finds advisor
3. Client adds funds
4. Client starts chat/video
5. Real-time billing works
6. Session ends with receipt
7. Client leaves rating
8. Advisor sees earning
9. Advisor requests withdrawal
10. Admin approves payout
```

## Troubleshooting

### Billing Not Deducting
- Check wallet balance > 0
- Verify cost per second calculation
- Check interval is running (1000ms)
- Verify client ID matches

### Session Not Starting
- Verify minimum balance (3 minutes worth)
- Check advisor is available
- Verify session IDs are valid
- Check Convex connection

### Warnings Not Showing
- Verify balance logic
- Check warning threshold values
- Verify onBalanceWarning callback

### Admin Panel Not Loading
- Verify user role is "admin"
- Check Convex queries return data
- Verify API endpoints respond

## Performance Optimization

1. **Billing Interval**: Adjust from 1s to 5s for testing
2. **Query Caching**: Convex automatically caches queries
3. **Batch Operations**: Group multiple mutations
4. **Database Indexes**: Already configured in schema

## Deployment Notes

1. Push Convex schema before deploying
2. Set all environment variables
3. Test billing on staging first
4. Monitor transaction logs
5. Set up error alerting

## Support & Customization

### Adjusting Platform Fee
Edit in `SessionTimer.tsx`:
```typescript
advisorEarning: totalCharged * 0.85 // 15% fee instead of 10%
```

### Changing Warning Thresholds
Edit in `billingService.ts`:
```typescript
if (minutesRemaining <= 1.5) // Change from 1 minute
if (minutesRemaining <= 3) // Change from 2 minutes
```

### Adding New Transaction Types
Add to Convex schema types and create new mutations.

## Next Steps

1. Push the schema to Convex
2. Create advisor setup page
3. Integrate with chat/video UI
4. Add payment gateway
5. Test full billing flow
6. Deploy to production
