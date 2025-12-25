# Schema Diff Analysis: Drizzle vs PayloadCMS Collections

## Summary
This document compares your custom Drizzle schemas (`/db/schema/`) with PayloadCMS Collections to identify fields that need to be transferred.

---

## Users Collection

### ✅ Already in PayloadCMS Collection:
- `clerkId` (text, unique)
- `email` (added by auth: true)
- `firstName`, `lastName` (from baseUserFields)
- `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`
- `roles` (select with hasMany - creates users_roles join table)
- `createdAt`, `updatedAt` (auto-added by Payload)

### ⚠️  Issues to Fix:
1. **`baseUserFields` includes `email`** - But `auth: true` already adds email, causing duplicate
   - **FIX**: Remove email from baseUserFields

2. **`roles` structure mismatch**:
   - Drizzle: `roles` as array column `userRoleEnum('roles').array()`
   - PayloadCMS: `roles` with `hasMany: true` creates separate `users_roles` table
   - **Decision needed**: Keep PayloadCMS approach (join table) or change to array?

3. **Missing auth columns** (Added by Payload automatically with `auth: true`):
   - `reset_password_token`, `reset_password_expiration`, `salt`, `hash`, `login_attempts`, `lock_until`
   - These are required for PayloadCMS admin authentication

---

## Players Collection

### ✅ Already in PayloadCMS:
- `user` (relationship to users - replaces userId)
- `firstName`, `lastName`, `email` (from baseUserFields)
- `city`, `highSchool`
- `heightInInches`, `weight`
- `unweightedGpa`, `weightedGpa`
- `primaryPosition`, `secondaryPosition`
- `bio`
- `aauTeam`, `aauCircuit`, `aauCoach`
- `phoneNumber`, `xHandle`, `instaHandle`, `tiktokHandle`, `ncaaId`
- `profileImageUrl`
- `highlightVideoUrls` (array)
- `awards` (array)
- `ppg`, `rpg`, `apg`
- `desiredLevelsOfPlay` (hasMany - join table)
- `desiredGeographicAreas` (hasMany - join table)
- `desiredDistanceFromHome`
- `isActive`, `isCommitted`, `committedWhere`
- `deletedAt`

### ⚠️  Fields to Add/Fix:

1. **`graduationYear` type mismatch**:
   - Drizzle: `varchar('graduation_year', { length: 4 })` - stores as string like "2025"
   - PayloadCMS: `type: 'number'`
   - **FIX**: Change to `type: 'text'` to match Drizzle (or decide on one approach)

2. **`state` field**:
   - Drizzle: `stateEnum('state')` - enforced enum
   - PayloadCMS: `type: 'text'` - no validation
   - **FIX**: Consider adding state enum options or keep as text

3. **Field name mismatches**:
   - Drizzle: `aauProgramName` → PayloadCMS: `aauProgram`
   - Drizzle: `aauTeamName` → PayloadCMS: `aauTeam`
   - **FIX**: Standardize field names (recommend keeping Collection names)

4. **Array field differences**:
   - Drizzle: Uses PostgreSQL arrays `desiredLevelOfPlayEnum('desired_levels_of_play').array()`
   - PayloadCMS: Uses `hasMany: true` which creates join tables
   - **Decision needed**: Join tables vs arrays

5. **Missing in Drizzle (PayloadCMS has these)**:
   - `potentialAreasOfStudy` - NOT in Drizzle schema
   - Interest checkboxes: `interestedInMilitaryAcademies`, `interestedInUltraHighAcademics`, `interestedInFaithBased`, `interestedInAllGirls`, `interestedInHBCU`
   - **ACTION**: These are Collection-only fields, keep them

6. **Awards structure**:
   - Drizzle: JSONB with `{ title, year, description? }`
   - PayloadCMS array: Only has `title` field
   - **FIX**: Add `year` and `description` fields to awards array

---

## Coaches Collection

### ✅ Already in PayloadCMS:
- `user` (relationship - replaces userId)
- `firstName`, `lastName`, `email` (from baseUserFields)
- `collegeId`, `collegeName`
- `phone`, `bio`, `profileImageUrl`
- `deletedAt`

### ⚠️  Fields to Add/Fix:

1. **Field name mismatch**:
   - Drizzle: `jobTitle`
   - PayloadCMS: `position` (select enum)
   - **FIX**: Rename PayloadCMS field to `position` (already done, but was `jobTitle` in Drizzle)
   - **Decision**: Keep `position` as enum or change to free text `jobTitle`?

---

## Recommended Action Plan

1. **Fix baseUserFields** - Remove duplicate email
2. **Update Players Collection**:
   - Change `graduationYear` to `type: 'text'`
   - Add `year` and `description` to awards array
   - Document field name changes (aauProgram vs aauProgramName)
3. **Decision on array fields**:
   - Option A: Keep PayloadCMS approach (join tables with `hasMany`)
   - Option B: Switch to PostgreSQL arrays (requires custom field type)
4. **Delete `/db/schema/` directory** after migrating all fields
5. **Use PayloadCMS Local API** for database operations in your app

---

## Notes on Architecture

- PayloadCMS with `@payloadcms/db-vercel-postgres` uses Drizzle internally
- Your Collections are the source of truth, not `/db/schema/`
- PayloadCMS generates migrations from Collections
- For multi-select fields, PayloadCMS uses join tables (not arrays) by default
