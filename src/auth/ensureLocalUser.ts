/**
 * @file Guarantees the current Zitadel user has a corresponding local user record.
 *
 * Why this module exists
 * ----------------------
 * Zitadel provisions a session as soon as the user submits the sign-up form,
 * but our backend only creates the local user record when the frontend hits
 * `/oauth-callback`. If the user defers email verification or closes the tab
 * before the AuthCallback route runs, the JWT ends up lacking `local_userid`
 * and every subsequent personalised API call will fail.
 *
 * This module re-runs the provisioning step whenever it detects the claim
 * is missing — on session restore, on silent renew, and on any userLoaded
 * event — so the system self-heals.
 *
 * Concurrency
 * -----------
 * Multiple auth events can fire in quick succession (e.g. initAuth + a
 * userLoaded emitted during the same tick). A module-level in-flight
 * Promise de-duplicates concurrent callers; once it resolves everyone
 * gets the same outcome.
 */

import type { User } from 'oidc-client-ts'
import { request } from '../api/api'
import { API_ENDPOINTS } from '../config/api-endpoints'
import { userManager, silentRenew } from './zitadel'
import { hasLocalUserId } from './jwt'

let inFlight: Promise<User | null> | null = null

/**
 * If the given user's JWT does not yet carry `local_userid`, call the
 * backend oauth-callback and refresh the token. Returns the up-to-date
 * user (post-refresh), or the original user if provisioning was not
 * needed. Returns `null` only when silent renew fails after a successful
 * callback — callers may treat that as transient and retry later.
 */
export async function ensureLocalUserRegistered(user: User): Promise<User | null> {
  if (hasLocalUserId(user)) return user
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      console.log('[Auth] local_userid missing, provisioning backend user')
      await request.post(API_ENDPOINTS.USER.OAUTH_CALLBACK, null, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      })

      const refreshed = await silentRenew()
      if (!refreshed) {
        console.warn('[Auth] silent renew returned no user after provisioning')
        return null
      }
      if (!hasLocalUserId(refreshed)) {
        // Backend call succeeded but the new token still lacks the claim —
        // likely a race with Zitadel metadata propagation; caller can retry.
        console.warn('[Auth] refreshed token still lacks local_userid')
      }
      return refreshed
    } catch (err) {
      console.warn('[Auth] ensureLocalUserRegistered failed:', err)
      return null
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

/**
 * Convenience helper: read the current user and ensure provisioning.
 * Exposed for callers that don't already hold a User reference.
 */
export async function ensureCurrentUserRegistered(): Promise<User | null> {
  const user = await userManager.getUser()
  if (!user || user.expired) return null
  return ensureLocalUserRegistered(user)
}
