# Expert Advisor Platform - Comprehensive Feature Documentation

## System Architecture Overview

This is a complete billing and session management system for an expert advisor platform supporting three user roles:
- **Clients**: Purchase and pay for expert consultations
- **Advisors**: Provide services and earn money
- **Admins**: Manage platform, disputes, and payouts

## Core Features Implementation

### 1. User Roles & Authentication

**File**: `convex/schema.ts`

User roles are stored in the database:
```typescript
role: "client" | "advisor" | "admin"
```

- **Clients**: Can browse advisors, initiate chat/video sessions
- **Advisors**: Can set pricing, manage availability, view earnings
- **Admins**: Full access to dashboard, disputes, payments

### 2. Advisor Profile Management

**Files**:
- `convex/advisorProfiles.ts` - Backend mutations/queries
- `components/AdvisorProfileSetup.tsx` - UI component
- `app/api/advisor/profile/route.ts` - API endpoint

**Features**:
- Bio and specialization management
- Separate per-minute pricing for chat and video
- Availability hours configuration (time + days)
- Profile completion percentage (0-100%)
- Average rating calculation

**Profile Completion Calculation**:
- Bio (20%): Minimum 20 characters
- Specializations (20%): At least 1 specialization
- Chat Pricing (20%): Greater than $0
- Video Pricing (20%): Greater than $0
- Availability (20%): At least 1 day selected

### 3. Wallet System

**Files**:
- `convex/wallet.ts` - Wallet logic
- `components/Wallet.tsx` - UI component
- `app/api/wallet/*` - API endpoints

**Key Functions**:
- `getWallet(userId)` - Get balance
- `addFunds(userId, amount)` - Add money to wallet
- `deductFunds(userId, amount)` - Deduct for sessions
- `getTransactionHistory(userId)` - Transaction logs

**Transaction Types**:
- `add`: Manual recharge by user
- `deduct`: Per-minute session billing
- `refund`: Dispute resolution refund
- `earning`: Advisor earning (pending)

### 4. Session Management

**Files**:
- `convex/sessions.ts` - Session logic
- `components/SessionTimer.tsx` - Session UI
- `lib/billingService.ts` - Real-time billing

**Session Lifecycle**:

1. **Creation**: `createSession(clientId, advisorId, type, pricePerMinute)`
   - Status: `pending` → `active`
   - Records wallet balance before session

2. **Active Session**:
   - Real-time per-second billing deduction
   - Balance warnings at 2 minutes and 1 minute remaining
   - Automatic pause at zero balance

3. **Pause/Resume**:
   - `pauseSession()` - Stops billing
   - `resumeSession()` - Resumes billing

4. **Completion**: `endSession()`
   - Final duration and total charged
   - Creates advisor earning record
   - Records wallet after balance

### 5. Per-Minute Billing Engine

**File**: `lib/billingService.ts`

**Real-Time Processing**:
```typescript
processBillingTick() {
  // Every second:
  - Calculate cost: duration * (pricePerMinute / 60)
  - Check balance
  - Deduct funds
  - Check warnings
  - Update UI
}
```

**Warning System**:
- **2-Minute Warning**: When `remainingBalance / pricePerMinute <= 2`
- **1-Minute Warning**: When `remainingBalance / pricePerMinute <= 1`
- **Zero Balance**: Session auto-pauses, client notified

**Cost Calculation**:
```
Total Charged = (Duration in seconds / 60) * Price per minute
Advisor Earning = Total Charged * 0.9 (90% after 10% platform fee)
```

### 6. Chat & Video Billing Rules

**Chat**:
- Billing pauses on inactivity
- Session becomes read-only at zero balance
- Can resume by adding funds

**Video**:
- Tracks disconnects
- Auto-pause on disconnect
- Resume within grace period (60 seconds default)
- Full disconnect = session ends

### 7. Session Receipts & Summary

**File**: `components/SessionTimer.tsx`

Receipt includes:
- Duration (HH:MM:SS format)
- Total amount charged
- Amount charged to client
- Advisor earning
- Starting and ending wallet balance
- Session type (Chat/Video)
- Timestamp

### 8. Document Management

**Files**:
- `convex/documents.ts` - Document operations
- `app/api/documents/*` - API endpoints

**Features**:
- Upload documents during session
- Link documents to session
- Secure download access
- Store upload metadata (size, type, uploader)

### 9. Ratings & Feedback

**Files**:
- `components/SessionRating.tsx` - Rating UI
- `convex/sessions.ts` - Rating mutations

**Rating Process**:
1. Post-session rating (1-5 stars)
2. Optional text feedback
3. Average rating updated on advisor profile
4. Rating count tracked

### 10. Earnings Dashboard

**Files**:
- `components/AdvisorEarnings.tsx` - UI
- `convex/earnings.ts` - Earnings logic

**Earnings Status**:
- `pending`: Session completed but not yet available
- `completed`: Available for withdrawal
- `withdrawn`: Transferred to advisor

**Statistics Shown**:
- Total completed earnings
- Pending earnings
- Already withdrawn
- Total sessions count
- Total hours worked
- Average per-hour rate

### 11. Payout System

**Files**:
- `convex/payouts.ts` - Payout logic
- `components/AdvisorEarnings.tsx` - Withdrawal form
- `app/api/advisor/payouts/*` - API endpoints

**Payout Process**:
1. Advisor provides bank details
2. Creates withdrawal request
3. Admin reviews and approves
4. Status: `pending` → `approved` → `completed`
5. Advisor receives confirmation

### 12. Dispute Handling

**Files**:
- `components/SessionDispute.tsx` - Dispute UI
- `convex/disputes.ts` - Dispute logic
- `app/api/admin/disputes/*` - API endpoints

**Dispute Reasons**:
- Advisor was unavailable or disconnected
- Session duration incorrect
- Service quality poor
- Wrong pricing applied
- Advisor unprofessional
- Other

**Resolution**:
1. Status: `open` → `investigating` → `resolved`/`rejected`
2. Admin can issue refund
3. Refund automatically added to client wallet
4. Transaction history updated

### 13. Admin Dashboard

**Files**:
- `components/AdminDashboard.tsx` - Full dashboard
- `app/api/admin/*` - Admin endpoints

**Admin Capabilities**:
- View platform revenue (10% of all charges)
- Track total sessions
- Monitor open disputes
- Manage pending payouts
- View all session data
- Issue manual refunds
- Approve/reject payouts

**Metrics**:
- Platform Revenue: Sum of all 10% platform fees
- Total Sessions: Count of all completed sessions
- Open Disputes: Count of unresolved disputes
- Pending Payouts: Count of pending withdrawal requests

## Database Schema

**Tables Created**:
1. `users` - Base user with role
2. `advisorProfiles` - Advisor-specific data
3. `wallets` - User balances
4. `sessions` - Session records with billing
5. `transactions` - Wallet transaction history
6. `earnings` - Advisor earnings
7. `documents` - Session documents
8. `ratings` - Session ratings
9. `balanceWarnings` - Warning logs
10. `payoutRequests` - Withdrawal requests
11. `disputes` - Dispute records

## API Endpoints

### Session Management
- `POST /api/sessions/start` - Start new session
- `POST /api/sessions/end` - End session
- `POST /api/sessions/pause` - Pause session
- `PUT /api/sessions/pause` - Resume session

### Advisor Operations
- `GET /api/advisor/profile` - Get advisor profile
- `POST /api/advisor/profile` - Create/update profile
- `GET /api/advisor/earnings` - Get earnings summary
- `GET/POST /api/advisor/payouts` - Manage payouts

### Admin Panel
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/sessions` - All sessions
- `GET/POST /api/admin/disputes` - Manage disputes

### Wallet
- `POST /api/wallet/add` - Add funds
- `POST /api/wallet/deduct` - Deduct funds
- `GET /api/wallet` - Get balance

## Security Considerations

1. **Authentication**: Clerk-based authentication
2. **Role-Based Access**: API endpoints verify user role
3. **Wallet Operations**: Only authenticated users can modify wallets
4. **Admin Actions**: Only admins can resolve disputes/payouts
5. **Data Isolation**: Users see only their own transactions

## Configuration

**Billing Parameters** (adjustable):
- Platform fee: 10% (in `SessionTimer` and calculations)
- Grace period for video disconnect: 60 seconds
- Warning thresholds: 2 minutes and 1 minute
- Minimum balance for session: 3 minutes worth

**Customization**:
Edit `lib/billingService.ts` and `lib/sessionUtils.ts` for adjustments.

## Testing Checklist

- [ ] Create advisor profile with all fields
- [ ] Set pricing and availability
- [ ] Add funds to client wallet
- [ ] Start chat session - verify billing
- [ ] Check balance warnings at 2-min and 1-min
- [ ] Pause and resume session
- [ ] End session - verify receipt
- [ ] Rate session post-completion
- [ ] View earnings as advisor
- [ ] Request withdrawal
- [ ] Admin approves/rejects payout
- [ ] Create dispute - admin resolution
- [ ] Verify refund to wallet

## Future Enhancements

1. Payment gateway integration (Stripe, PayPal)
2. Automated recurring billing
3. Group sessions billing
4. Subscription plans
5. Affiliate commissions
6. Advanced analytics
7. Video recording storage
8. AI-powered session insights
9. Mobile app support
10. Multi-currency support
