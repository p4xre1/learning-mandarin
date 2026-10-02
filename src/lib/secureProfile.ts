import { Preferences } from "@capacitor/preferences"

export type LocalProfile = {
  displayName: string
  createdAt: string
}

type VaultRecord = {
  version: 1
  salt: string
  iv: string
  cipher: string
}

type AttemptState = {
  count: number
  lockedUntil: number
}

const MAX_NAME_LENGTH = 40
const MAX_ATTEMPTS = 100
const MAX_LOCKOUT_MS = 15 * 60_000

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const ATTEMPT_KEY = "mingdao-profile-attempts"
const VAULT_KEY = "mingdao-profile-vault"

function bytesToBase64(bytes: Uint8Array) {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function isVaultRecord(value: unknown): value is VaultRecord {
  if (!value || typeof value !== "object") return false
  const record = value as Partial<VaultRecord>
  return (
    record.version === 1 &&
    typeof record.salt === "string" &&
    typeof record.iv === "string" &&
    typeof record.cipher === "string"
  )
}

function isLocalProfile(value: unknown): value is LocalProfile {
  if (!value || typeof value !== "object") return false
  const profile = value as Partial<LocalProfile>
  return (
    typeof profile.displayName === "string" &&
    profile.displayName.length > 0 &&
    profile.displayName.length <= MAX_NAME_LENGTH &&
    typeof profile.createdAt === "string" &&
    !Number.isNaN(Date.parse(profile.createdAt))
  )
}

function parseAttemptState(value: string | null): AttemptState {
  if (!value) return { count: 0, lockedUntil: 0 }
  try {
    const parsed = JSON.parse(value) as Partial<AttemptState>
    const count = parsed.count
    const lockedUntil = parsed.lockedUntil
    if (
      typeof count === "number" &&
      Number.isInteger(count) &&
      count >= 0 &&
      count <= MAX_ATTEMPTS &&
      typeof lockedUntil === "number" &&
      Number.isFinite(lockedUntil) &&
      lockedUntil >= 0
    ) {
      return { count, lockedUntil }
    }
  } catch {
    // Treat corrupted local state as a fresh lockout record.
  }
  return { count: 0, lockedUntil: 0 }
}

async function deriveKey(pin: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 210_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function hasLocalProfile() {
  const result = await Preferences.get({ key: VAULT_KEY })
  if (!result.value) return false
  try {
    return isVaultRecord(JSON.parse(result.value))
  } catch {
    return false
  }
}

export async function createLocalProfile(displayName: string, pin: string) {
  const normalizedName = displayName.trim()
  if (!normalizedName || normalizedName.length > MAX_NAME_LENGTH) {
    throw new Error("invalid-display-name")
  }
  if (!/^\d{4,8}$/.test(pin)) throw new Error("invalid-pin")

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pin, salt)
  const profile: LocalProfile = {
    displayName: normalizedName,
    createdAt: new Date().toISOString(),
  }
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(profile)),
  )
  const record: VaultRecord = {
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(new Uint8Array(encrypted)),
  }
  await Preferences.set({ key: VAULT_KEY, value: JSON.stringify(record) })
  await Preferences.remove({ key: ATTEMPT_KEY })
  return profile
}

export async function unlockLocalProfile(pin: string) {
  const attempts = await Preferences.get({ key: ATTEMPT_KEY })
  const attemptState = parseAttemptState(attempts.value)

  if (attemptState.lockedUntil > Date.now()) {
    return {
      status: "locked" as const,
      retryAfter: Math.ceil((attemptState.lockedUntil - Date.now()) / 1000),
    }
  }

  const stored = await Preferences.get({ key: VAULT_KEY })
  if (!stored.value) return { status: "missing" as const }

  try {
    const record = JSON.parse(stored.value) as VaultRecord
    if (!isVaultRecord(record)) throw new Error("invalid-vault-record")
    const key = await deriveKey(pin, base64ToBytes(record.salt))
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(record.iv) },
      key,
      base64ToBytes(record.cipher),
    )
    await Preferences.remove({ key: ATTEMPT_KEY })
    const profile = JSON.parse(decoder.decode(decrypted)) as unknown
    if (!isLocalProfile(profile)) throw new Error("invalid-profile")
    return {
      status: "success" as const,
      profile,
    }
  } catch {
    const count = attemptState.count + 1
    const lockedUntil =
      count >= 5
        ? Date.now() +
          Math.min(MAX_LOCKOUT_MS, 30_000 * 2 ** Math.min(count - 5, 5))
        : 0
    await Preferences.set({
      key: ATTEMPT_KEY,
      value: JSON.stringify({ count, lockedUntil }),
    })
    return {
      status: lockedUntil ? "locked" as const : "invalid" as const,
      retryAfter: lockedUntil
        ? Math.ceil((lockedUntil - Date.now()) / 1000)
        : undefined,
      attemptsRemaining: lockedUntil ? 0 : Math.max(0, 5 - count),
    }
  }
}

export async function deleteLocalProfile() {
  await Preferences.remove({ key: VAULT_KEY })
  await Preferences.remove({ key: ATTEMPT_KEY })
}
