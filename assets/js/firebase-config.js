/**
 * ============================================================================
 * FIREBASE CONFIGURATION & SERVICE LAYER
 * Bentham Science - Cybersecurity GRC Book Chapter CFP Portal
 * ============================================================================
 * Supports:
 *  1. Firebase Authentication (Register / Login / Roles)
 *  2. Cloud Firestore (Author Profiles & Chapter Submissions)
 *  3. Firebase Storage (Manuscript PDF / DOCX Uploads)
 *  4. Intelligent Mock/Local Fallback: Works right out-of-the-box even before
 *     production API keys are pasted in!
 * ============================================================================
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

// ============================================================================
// 1. FIREBASE PROJECT CONFIGURATION
// Replace the values below with your credentials from Firebase Console:
// https://console.firebase.google.com/
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyAjzLlFoX1SShaHUfABa_CI-EyFtDE2oxQ",
  authDomain: "cybersecuritygrc-35d67.firebaseapp.com",
  projectId: "cybersecuritygrc-35d67",
  storageBucket: "cybersecuritygrc-35d67.firebasestorage.app",
  messagingSenderId: "404049399542",
  appId: "1:404049399542:web:5408678d16e4a59444e6d7",
  measurementId: "G-28XLJ60SYD"
};

// Check if credentials have been replaced with real project keys
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("🔥 [Firebase] Connected to live Firebase project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("⚠️ [Firebase] Initialization failed, falling back to local simulation mode:", err);
  }
} else {
  console.info("ℹ️ [Firebase] Placeholder config detected. Running in seamless Local Simulation mode for instant testing. Replace keys in assets/js/firebase-config.js for live cloud deployment.");
}

// ============================================================================
// 2. LOCAL SIMULATION / MOCK STORAGE ENGINE (For instant zero-setup testing)
// ============================================================================
const STORAGE_KEYS = {
  USERS: 'cgrc_mock_users',
  CURRENT_USER: 'cgrc_mock_current_user',
  SUBMISSIONS: 'cgrc_mock_submissions'
};

function getLocalData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

// Initialize seed demo data if none exists
if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
  const seedSubmissions = [
    {
      id: 'sub-seed-1',
      authorId: 'seed-author-1',
      authorName: 'Dr. Jane Doe',
      authorEmail: 'jane.doe@cyberuniversity.edu',
      authorInstitution: 'Cybersecurity Research Institute',
      topicNumber: '02',
      topicName: 'AI Oversight and Ethical Governance',
      title: 'Algorithmic Accountability Frameworks in Enterprise Risk Management',
      abstract: 'This chapter examines regulatory compliance requirements for generative AI deployment across regulated industries, analyzing EU AI Act, NIST AI RMF, and automated auditing pipelines.',
      keywords: 'AI Governance, EU AI Act, Risk Assessment, GRC',
      fileName: 'Proposal_Algorithmic_Accountability.pdf',
      fileUrl: '#mock-file-download',
      fileSize: '1.2 MB',
      status: 'Under Review',
      reviewNotes: 'Editorial review currently in progress by Chapter Track Editor.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'sub-seed-2',
      authorId: 'seed-author-2',
      authorName: 'Prof. Rajesh Kumar',
      authorEmail: 'rkumar@techinst.ac.in',
      authorInstitution: 'Indian Institute of Technology',
      topicNumber: '05',
      topicName: 'Zero-Trust Architectures in GRC',
      title: 'Zero-Trust Continuous Compliance in Multi-Cloud Healthcare Environments',
      abstract: 'A comprehensive investigation into HIPAA and HITRUST automated evidence gathering using policy-as-code and zero-trust identity federation.',
      keywords: 'Zero-Trust, Cloud Security, HIPAA, Compliance Automation',
      fileName: 'Draft_ZeroTrust_Healthcare_GRC.pdf',
      fileUrl: '#mock-file-download',
      fileSize: '2.4 MB',
      status: 'Accepted',
      reviewNotes: 'Accepted for inclusion in Topic 05. Formal notification dispatched.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];
  setLocalData(STORAGE_KEYS.SUBMISSIONS, seedSubmissions);
}

// ============================================================================
// 3. AUTHENTICATION SERVICES
// ============================================================================

/**
 * Register a new user (Author or Reviewer/Admin)
 */
export async function registerUser({ email, password, fullName, institution, role = 'author', adminKey = '' }) {
  // Validate reviewer passcode if role is admin
  if (role === 'admin' && adminKey.trim() !== 'CGRC2027ADMIN') {
    throw new Error('Invalid Reviewer Security Passcode. Please contact the Editor-in-Chief.');
  }

  if (isConfigured && auth && db) {
    // Live Firebase Registration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    const userProfile = {
      uid: user.uid,
      email,
      fullName,
      institution,
      role,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return { ...userProfile, uid: user.uid };
  } else {
    // Local Simulation
    const users = getLocalData(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      uid: 'user_' + Date.now(),
      email,
      fullName,
      institution,
      role,
      createdAt: new Date().toISOString()
    };
    users.push({ ...newUser, password }); // Note: mock storage
    setLocalData(STORAGE_KEYS.USERS, users);
    setLocalData(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email, password) {
  if (isConfigured && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      fullName: cred.user.displayName || 'User',
      role: 'author'
    };
  } else {
    // Local Simulation
    const users = getLocalData(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    // Quick demo fallback logins if user hasn't registered yet
    if (!user) {
      if (email === 'admin@cgrc.org' && password === 'admin123') {
        const demoAdmin = {
          uid: 'demo_admin',
          email: 'admin@cgrc.org',
          fullName: 'Editorial Board Admin',
          institution: 'Bentham Science Editorial Board',
          role: 'admin'
        };
        setLocalData(STORAGE_KEYS.CURRENT_USER, demoAdmin);
        return demoAdmin;
      }
      if (email === 'author@test.com' && password === 'author123') {
        const demoAuthor = {
          uid: 'seed-author-1',
          email: 'author@test.com',
          fullName: 'Dr. Jane Doe',
          institution: 'Cybersecurity Research Institute',
          role: 'author'
        };
        setLocalData(STORAGE_KEYS.CURRENT_USER, demoAuthor);
        return demoAuthor;
      }
      throw new Error('Invalid email or password.');
    }

    const { password: _, ...safeUser } = user;
    setLocalData(STORAGE_KEYS.CURRENT_USER, safeUser);
    return safeUser;
  }
}

/**
 * Sign in with Google (OAuth Popup)
 */
export async function signInWithGoogle() {
  if (isConfigured && auth && db) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      const newProfile = {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'Google User',
        institution: '',
        role: 'author',
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
    return userSnap.data();
  } else {
    // Local simulation fallback
    const mockGoogleUser = {
      uid: 'google_user_' + Date.now(),
      email: 'researcher@gmail.com',
      fullName: 'Google Researcher',
      institution: 'Academic Institution',
      role: 'author'
    };
    setLocalData(STORAGE_KEYS.CURRENT_USER, mockGoogleUser);
    return mockGoogleUser;
  }
}

/**
 * Logout current user
 */
export async function logoutUser() {
  if (isConfigured && auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

/**
 * Observe auth state changes
 */
export function subscribeToAuth(callback) {
  if (isConfigured && auth && db) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data());
          } else {
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName || 'User',
              role: 'author'
            });
          }
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  } else {
    const user = getLocalData(STORAGE_KEYS.CURRENT_USER, null);
    callback(user);
    // Listen for storage events (cross-tab sync)
    const handler = (e) => {
      if (e.key === STORAGE_KEYS.CURRENT_USER) {
        callback(getLocalData(STORAGE_KEYS.CURRENT_USER, null));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

/**
 * Get currently authenticated profile synchronously
 */
export function getCurrentSessionUser() {
  return getLocalData(STORAGE_KEYS.CURRENT_USER, null);
}

// ============================================================================
// 4. STORAGE SERVICE (Manuscript Uploads)
// ============================================================================

/**
 * Upload manuscript file to Firebase Storage with progress tracking
 */
export function uploadManuscriptFile(file, authorId, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected for upload.'));
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      return reject(new Error('Only PDF or Word documents (.pdf, .doc, .docx) are allowed.'));
    }

    // Size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      return reject(new Error('File size exceeds the 25MB limit.'));
    }

    if (isConfigured && storage) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `manuscripts/${authorId}/${Date.now()}_${sanitizedName}`;
      const storageReference = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageReference, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          });
        }
      );
    } else {
      // Local simulation with simulated upload delay
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const mockUrl = URL.createObjectURL(file);
          resolve({
            downloadUrl: mockUrl,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          });
        }
      }, 150);
    }
  });
}

// ============================================================================
// 5. FIRESTORE DATABASE SERVICE (Chapter Submissions)
// ============================================================================

/**
 * Submit a new chapter proposal & manuscript
 */
export async function createChapterSubmission(submissionData) {
  const payload = {
    ...submissionData,
    status: 'Pending',
    reviewNotes: 'Submission received. Awaiting initial editorial review.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...payload,
      createdAtServer: serverTimestamp()
    });
    return { ...payload, id: docRef.id };
  } else {
    const submissions = getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
    const newSubmission = {
      ...payload,
      id: 'sub_' + Date.now()
    };
    submissions.unshift(newSubmission);
    setLocalData(STORAGE_KEYS.SUBMISSIONS, submissions);
    return newSubmission;
  }
}

/**
 * Fetch all submissions created by a specific author
 */
export async function getAuthorSubmissions(authorId) {
  if (isConfigured && db) {
    const q = query(
      collection(db, 'submissions'),
      where('authorId', '==', authorId),
      orderBy('createdAtServer', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    const submissions = getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
    return submissions.filter(s => s.authorId === authorId);
  }
}

/**
 * Fetch all submissions for the Admin / Reviewer dashboard
 */
export async function getAllSubmissions() {
  if (isConfigured && db) {
    const q = query(collection(db, 'submissions'), orderBy('createdAtServer', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    return getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
  }
}

/**
 * Update submission status and review notes (Admin only)
 */
export async function updateSubmissionReview(submissionId, { status, reviewNotes }) {
  const validStatuses = ['Pending', 'Under Review', 'Accepted', 'Revision Requested', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid review status.');
  }

  if (isConfigured && db) {
    const docRef = doc(db, 'submissions', submissionId);
    await updateDoc(docRef, {
      status,
      reviewNotes: reviewNotes || '',
      updatedAtServer: serverTimestamp()
    });
    return { submissionId, status, reviewNotes };
  } else {
    const submissions = getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
    const idx = submissions.findIndex(s => s.id === submissionId);
    if (idx === -1) {
      throw new Error('Submission not found.');
    }
    submissions[idx].status = status;
    submissions[idx].reviewNotes = reviewNotes || '';
    submissions[idx].updatedAt = new Date().toISOString();
    setLocalData(STORAGE_KEYS.SUBMISSIONS, submissions);
    return submissions[idx];
  }
}
