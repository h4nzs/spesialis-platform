# Privacy

## Privacy by Design

The analytics platform is built with privacy-first principles. No PII ever leaves the browser.

## Three-Layer PII Protection

### Layer 1: Registry Privacy Levels

Every property in the registry has a `privacy` classification:

```ts
prop({ key: 'email_hash', type: 'string', privacy: 'sensitive', ... })
prop({ key: 'amount', type: 'number', privacy: 'sensitive', ... })
```

Properties marked as `sensitive` or `pii` are automatically filtered out before dispatch. Properties marked as `internal` are never sent to any provider.

### Layer 2: PII Pattern Matching

Even without registry entries, the system blocks known PII patterns:

```
/^email$/i, /^phone$/i, /^phone_number$/i, /^mobile$/i,
/^whatsapp$/i, /^address$/i, /^full_name$/i, /^name$/i,
/^password/i, /^token/i, /^jwt/i, /^session/i, /^secret/i,
/^credit_card/i, /^card_number/i, /^cvv/i, /^pin$/i,
/^otp$/i, /^ssn/i, /^ktp/i, /^nik$/i, /^npwp/i, /^ip_address/i
```

All patterns are case-insensitive.

### Layer 3: Depth & Circular Reference Protection

- **Max depth**: 10 levels of nested objects
- **Circular references**: Detected via `WeakSet`, silently skipped
- **Arrays**: Passed through as-is (primitive arrays are safe)

## What Gets Filtered

The following properties are ALWAYS blocked:

1. **Email** — never track raw email addresses
2. **Phone** — never track phone numbers
3. **Name** — never track full names
4. **Password/Token/JWT** — never track credentials
5. **Address** — never track physical addresses
6. **Identity Numbers** — never track KTP, NIK, NPWP, SSN
7. **Payment Details** — never track credit card numbers, CVV
8. **Session Tokens** — never track session IDs or tokens
9. **IP Addresses** — never track raw IPs

## What's Safe to Track

```ts
// ✅ Safe — public properties
track('pageview', { url: '/', title: 'Home' });

// ✅ Safe — service identifiers
track('booking_submit', { service_id: 'srv-001', booking_id: 'bk-001', customer_type: 'guest' });

// ✅ Safe — hashed identifiers
track('register_complete', { user_id: 'usr-001', role: 'customer', email_hash: 'a1b2c3...' });
```

## Assessing Privacy Level

```ts
import { assessPrivacyLevel } from '@spesialis/analytics';

const level = assessPrivacyLevel({ email: 'test@test.com' });
// Returns: 'pii'
```

## Security Checklist

- [ ] No PII in any event property
- [ ] User IDs are opaque identifiers, not emails
- [ ] `email_hash` is SHA-256 of email, never raw email
- [ ] Payment amounts are tracked without card details
- [ ] Session IDs are random strings, not user identifiers
- [ ] Error messages are sanitized (no stack traces with PII)
- [ ] All new properties have appropriate privacy levels
- [ ] Property registry is reviewed quarterly for privacy compliance
