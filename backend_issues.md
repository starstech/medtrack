# Backend Issues to Fix

## Authentication Issues

1. **JWT Token Structure**: The backend is expecting a different JWT token structure than what Supabase provides. Specifically, it's trying to access `user.sub` which doesn't exist in Supabase's JWT format.

2. **Push Notification Subscription**: The `/api/push/subscribe` endpoint is expecting `deviceToken` and `deviceType` parameters, but the frontend was sending a `subscription` object.

## API Endpoints

1. **Notification Endpoints**: 
   - `/notifications` - Check if this endpoint is properly handling the Supabase JWT token
   - `/notifications/preferences` - Verify this endpoint exists and works with Supabase auth

2. **Patient Endpoints**:
   - Ensure all patient endpoints are compatible with Supabase JWT token structure

## Required Backend Changes

1. Update JWT validation middleware to work with Supabase's JWT format
2. Modify user identification to use Supabase's user ID format instead of `sub` claim
3. Update push notification subscription endpoint to properly validate the request

## Testing Plan

1. Test authentication flow with Supabase tokens
2. Verify API endpoints accept Supabase JWT tokens
3. Test push notification subscription with correct parameters
4. Ensure all user-specific data is correctly associated with Supabase user IDs 