# SaveProgramButton - Test Plan

## Component Overview
The SaveProgramButton is a client-side React component that allows players to save/unsave college programs to their personal list.

## Test Cases

### 1. Initial Render Tests
- [ ] Component renders with default unsaved state (initialIsSaved=false)
- [ ] Component renders with saved state (initialIsSaved=true)
- [ ] Bookmark icon is unfilled when unsaved
- [ ] Bookmark icon is filled when saved
- [ ] Correct text displays: "Save" when unsaved, "Saved" when saved
- [ ] Small size variant hides text label
- [ ] Correct accessibility label uses collegeName

### 2. Save Functionality Tests
- [ ] Clicking unsaved button calls saveProgram(collegeId)
- [ ] Optimistic update: Button immediately shows saved state
- [ ] Loading state: Button is disabled during save operation
- [ ] Success: Button remains in saved state after successful save
- [ ] Router refresh is called after successful save
- [ ] Error: Button reverts to unsaved state on error
- [ ] Error: Alert shows error message with collegeName

### 3. Unsave Functionality Tests
- [ ] Clicking saved button calls unsaveProgram(collegeId)
- [ ] Optimistic update: Button immediately shows unsaved state
- [ ] Loading state: Button is disabled during unsave operation
- [ ] Success: Button remains in unsaved state after successful unsave
- [ ] Router refresh is called after successful unsave
- [ ] Error: Button reverts to saved state on error
- [ ] Error: Alert shows error message with collegeName

### 4. Props Tests
- [ ] collegeId is passed correctly to server actions
- [ ] collegeName is used in aria-label
- [ ] collegeName is used in error messages
- [ ] variant prop is passed to Toggle component
- [ ] size prop is passed to Toggle component
- [ ] className prop is applied to Toggle component

### 5. Error Handling Tests
- [ ] Generic error shows fallback message with collegeName
- [ ] Error instance shows error.message
- [ ] Console.error logs the error
- [ ] State reverts on error
- [ ] Button re-enables after error

### 6. Visual Tests
- [ ] Saved state: Blue background (bg-blue-600)
- [ ] Saved state: Blue hover (hover:bg-blue-700)
- [ ] Saved state: White text
- [ ] Unsaved state: White background (bg-white)
- [ ] Unsaved state: Dark mode background (dark:bg-slate-800)
- [ ] Unsaved state: Border styling matches SavePlayerButton

### 7. Accessibility Tests
- [ ] Aria-label changes based on saved state
- [ ] Aria-label includes collegeName for context
- [ ] Button is keyboard accessible
- [ ] Button disabled state is properly communicated

## Manual Testing Steps

### Setup
1. Ensure user is logged in as a player role
2. Navigate to a college program page
3. Insert SaveProgramButton component with test props

### Test Sequence
1. Initial render with unsaved state
   ```tsx
   <SaveProgramButton collegeId={123} collegeName="Duke University" />
   ```
2. Click to save - verify optimistic update and success
3. Refresh page - verify saved state persists (initialIsSaved={true})
4. Click to unsave - verify optimistic update and success
5. Test error scenario - mock server action to throw error
6. Verify error handling and state reversion

### Edge Cases
1. Rapid clicking (multiple clicks during loading)
2. Network timeout
3. User not authenticated
4. User is coach (not player)
5. College ID doesn't exist

## Integration Tests

### Server Action Integration
- [ ] saveProgram is called with correct collegeId
- [ ] unsaveProgram is called with correct collegeId
- [ ] Actions properly validate user role
- [ ] Actions properly create/delete records in player-saved-programs collection
- [ ] revalidatePath is called for correct paths

### Database Integration
- [ ] Saved programs appear in player's list
- [ ] Unsaved programs are removed from player's list
- [ ] Duplicate saves are handled (already saved error)
- [ ] Concurrent saves from different sessions handled correctly

## Code Review Checklist

### Code Quality
- [x] Follows SavePlayerButton pattern
- [x] Uses optimistic updates
- [x] Proper error handling with state reversion
- [x] TypeScript types are correct
- [x] Props interface is well-defined
- [x] Uses server actions (modern approach)

### Best Practices
- [x] Client component directive ('use client')
- [x] React hooks used correctly (useState, useTransition)
- [x] Accessibility labels use collegeName
- [x] Error messages use collegeName
- [x] Loading states handled
- [x] Disabled state during operations
- [x] Console logging for debugging

### Consistency
- [x] Same icon as SavePlayerButton (Bookmark)
- [x] Same text pattern (Save/Saved)
- [x] Same visual styling (colors, hover states)
- [x] Same variant and size options
- [x] Same prop structure

## Performance Considerations
- Optimistic updates provide instant feedback
- useTransition for non-blocking router refresh
- Minimal re-renders (only state changes)
- Server actions executed efficiently

## Security Considerations
- Server actions validate user authentication
- Server actions validate user role (player only)
- CollegeId validation in server actions
- Proper error messages without exposing internals
