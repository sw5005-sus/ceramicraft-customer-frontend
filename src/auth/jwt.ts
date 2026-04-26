/**
 * @file JWT token introspection helpers (safe, no crypto verification).
 * Used to derive client-side state from claims already validated by oidc-client-ts.
 */

import type { User } from 'oidc-client-ts'

/**
 * Check whether the user's token already carries a `local_userid` claim
 * (written by the backend into Zitadel user metadata on first successful
 * oauth-callback). Absence means the user has not been provisioned yet.
 *
 * Zitadel exposes user metadata in two places when the OIDC scope
 * `urn:zitadel:iam:user:metadata` is requested:
 *   - id_token / userinfo profile: `urn:zitadel:iam:user:metadata.local_userid` (base64)
 *   - access_token custom claim:   top-level `local_userid` (plain number)
 * We accept either.
 */
export function hasLocalUserId(user: User): boolean {
  try {
    const metadata = user.profile?.['urn:zitadel:iam:user:metadata'] as
      | Record<string, string>
      | undefined

    if (metadata?.local_userid) return true

    const parts = user.access_token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      if (payload?.local_userid) return true
      const atMetadata = payload?.['urn:zitadel:iam:user:metadata'] as
        | Record<string, string>
        | undefined
      if (atMetadata?.local_userid) return true
    }
  } catch (e) {
    console.warn('[Auth] Failed to parse token metadata:', e)
  }
  return false
}
