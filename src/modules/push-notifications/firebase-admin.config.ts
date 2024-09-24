import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Load your service account key JSON
import serviceAccountJson from './roomey-cfa9c-firebase-adminsdk-2qpii-9bdc02a5a9.json';

const serviceAccount = serviceAccountJson as ServiceAccount;
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
