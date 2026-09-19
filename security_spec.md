# DigiSathi Security Specification

## 1. Data Invariants
- Every document in `/users/{userId}/documents/{documentId}` must have `userId == request.auth.uid`.
- Users cannot access, read, query, create, or modify other users' documents or profile documents.
- User profile at `/users/{userId}` can only be created and accessed by the authenticated user whose `request.auth.uid == userId`.
- Immutability: `userId`, `createdAt`, and document `id` cannot be modified on update.
- System boundary: Path variables must conform to valid alphanumeric identifiers (`^[a-zA-Z0-9_\\-]+$`) with length <= 128 chars.
- Timestamps must be validated against `request.time` on create/update.

## 2. The "Dirty Dozen" Payloads (Expected to be REJECTED)
1. **Unauthenticated Read**: Attempting to read `/users/user123` or `/users/user123/documents/doc1` with `request.auth == null` -> DENIED.
2. **Cross-User Snooping**: Authenticated user `userABC` reading `/users/userXYZ/documents/doc1` -> DENIED.
3. **Cross-User List Scraping**: Authenticated user `userABC` running a list query on `/users/userXYZ/documents` -> DENIED.
4. **Forged Owner Creation**: Authenticated user `userABC` creating a document in `/users/userABC/documents/doc1` with payload `userId: "userXYZ"` -> DENIED.
5. **Path / UID Mismatch**: Authenticated user `userABC` attempting to write to `/users/userXYZ/documents/doc1` -> DENIED.
6. **Ghost Key Injection**: Attempting to create a userProfile with unauthorized field `{ role: "admin" }` or `{ isVerified: true }` -> DENIED.
7. **Junk Path ID Poisoning**: Attempting to create a document with a 500-character malicious path ID containing SQL/XSS characters -> DENIED (`isValidId` check).
8. **Tampered Creation Timestamp**: Attempting to set `createdAt` to a historical or future timestamp rather than `request.time` -> DENIED.
9. **Tampered Immutable Owner on Update**: Attempting to update `userId` or `createdAt` on an existing document -> DENIED.
10. **Oversized String Injection**: Attempting to insert a 2MB plainSummary string -> DENIED (`.size() <= 10000`).
11. **Arbitrary Collection Write**: Attempting to write to `/system_settings/config` or `/admins/userABC` -> DENIED (default deny catch-all).
12. **Unverified Email Privilege Escalation**: Attempting to modify restricted fields when email is not present -> DENIED.
