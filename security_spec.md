# Security Specification for Gaming Community Subscription Form

This specification outlines the data invariants, potential attack vectors ("Dirty Dozen" payloads), and rules for protecting the public `/subscriptions` collection.

## 1. Data Invariants
- **Email Integrity**: Every subscriber must have a valid email format under 256 characters.
- **Country Validity**: Every subscriber must declare a country (between 2 and 100 characters).
- **Temporal Honesty**: The `createdAt` timestamp must match the exact server timestamp (`request.time` on writes).
- **Public Sandbox Prevention**: To prevent random document scraping or listing, public reads (`list` and `get`) are completely disabled.
- **Spam prevention**: Writes are validated strictly for structure.

## 2. The "Dirty Dozen" Payloads
The following payloads constitute invalid write requests that must be rejected:

1. **Payload 1: Empty email**
   `{ "email": "", "country": "United States", "createdAt": "SERVER_TIMESTAMP" }`
2. **Payload 2: Missing country**
   `{ "email": "valid@email.com", "createdAt": "SERVER_TIMESTAMP" }`
3. **Payload 3: Malformed email structure**
   `{ "email": "invalid-email-no-at-sign", "country": "Germany", "createdAt": "SERVER_TIMESTAMP" }`
4. **Payload 4: Injection attack on Email field (oversized)**
   `{ "email": "a".repeat(500) + "@example.com", "country": "Spain", "createdAt": "SERVER_TIMESTAMP" }`
5. **Payload 5: Injection attack on Country field (oversized)**
   `{ "email": "john@email.com", "country": "A".repeat(500), "createdAt": "SERVER_TIMESTAMP" }`
6. **Payload 6: Client-side fake spoof timestamp**
   `{ "email": "valid@email.com", "country": "France", "createdAt": "2020-01-01T00:00:00Z" }`
7. **Payload 7: Additional unapproved ("Ghost") key (isPremium)**
   `{ "email": "valid@email.com", "country": "Canada", "createdAt": "SERVER_TIMESTAMP", "isPremium": true }`
8. **Payload 8: Wrong email data type (Integer)**
   `{ "email": 12345, "country": "United Kingdom", "createdAt": "SERVER_TIMESTAMP" }`
9. **Payload 9: Wrong country data type (Boolean)**
   `{ "email": "valid@email.com", "country": true, "createdAt": "SERVER_TIMESTAMP" }`
10. **Payload 10: Update existing subscription (Immutable after write)**
    Modifying an already added email index or country is restricted.
11. **Payload 11: Deleting subscriptions**
    Publicly deleting any subscription is prohibited.
12. **Payload 12: Directory list harvest**
    Attempting to perform a list/get query across `/subscriptions` fails.
