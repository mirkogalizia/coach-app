// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    readFileSync(
      join(process.cwd(), "coach-app-de920-firebase-adminsdk-fbsvc-7b414a5af6.json"),
      "utf8"
    )
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();