import { Request } from "express"
import { getApps, getApp, initializeApp, cert } from "firebase-admin/app"
import { UserRecord, getAuth } from "firebase-admin/auth"

const {
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_ADMIN_CLIENT_EMAIL,
} = process.env

if (!FIREBASE_ADMIN_PROJECT_ID)
  throw new Error("Missing or invalid Firebase Admin project ID")

if (!FIREBASE_ADMIN_PRIVATE_KEY)
  throw new Error("Missing or invalid Firebase Admin private key")

if (!FIREBASE_ADMIN_CLIENT_EMAIL)
  throw new Error("Missing or invalid Firebase Admin client email")

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: FIREBASE_ADMIN_PROJECT_ID,
          privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        }),
      })
    : getApp()

const auth = getAuth(app)

export async function getUserIdFromHeaders(req: Request) {
  const { authorization } = req.headers
  if (!authorization) return null

  const idToken = authorization.split(" ")[1]
  if (!idToken) return null

  const { uid } = await auth.verifyIdToken(idToken)
  return uid
}

export function getUserProfile(userId: string) {
  return auth.getUser(userId)
}

export async function getAllUsers(
  nextPageToken?: string
): Promise<UserRecord[]> {
  const listUsersResult = await auth.listUsers(1000, nextPageToken)

  if (listUsersResult.pageToken) {
    const nextUsers = await getAllUsers(listUsersResult.pageToken)
    const result = [...listUsersResult.users, ...nextUsers]
    return result
  } else {
    return listUsersResult.users
  }
}
