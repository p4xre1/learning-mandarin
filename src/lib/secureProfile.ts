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
  return result.value !== null
}

export async function createLocalProfile(displayName: string, pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pin, salt)
  const profile: LocalProfile = {
    displayName: displayName.trim(),
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
  const attemptState = attempts.value
    ? JSON.parse(attempts.value) as AttemptState
    : { count: 0, lockedUntil: 0 }

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
    const key = await deriveKey(pin, base64ToBytes(record.salt))
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(record.iv) },
      key,
      base64ToBytes(record.cipher),
    )
    await Preferences.remove({ key: ATTEMPT_KEY })
    return {
      status: "success" as const,
      profile: JSON.parse(decoder.decode(decrypted)) as LocalProfile,
    }
  } catch {
    const count = attemptState.count + 1
    const lockedUntil = count >= 5 ? Date.now() + 30_000 : 0
    await Preferences.set({
      key: ATTEMPT_KEY,
      value: JSON.stringify({ count: lockedUntil ? 0 : count, lockedUntil }),
    })
    return {
      status: lockedUntil ? "locked" as const : "invalid" as const,
      retryAfter: lockedUntil ? 30 : undefined,
      attemptsRemaining: lockedUntil ? 0 : 5 - count,
    }
  }
}

export async function deleteLocalProfile() {
  await Preferences.remove({ key: VAULT_KEY })
  await Preferences.remove({ key: ATTEMPT_KEY })
}
