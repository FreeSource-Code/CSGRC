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
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
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
    const full = { ...userProfile, uid: user.uid };
    setLocalData(STORAGE_KEYS.CURRENT_USER, full);
    return full;
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
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const isEditorialAdmin = isAdminEmail(cred.user.email);
    const assignedRole = isEditorialAdmin ? 'admin' : 'user';
    const realName = formatDisplayName(cred.user.displayName, cred.user.email);

    let profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      fullName: realName,
      role: assignedRole
    };

    try {
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists()) {
        profile = { ...userDoc.data(), ...profile };
      }
      profile.role = assignedRole;
      profile.email = cred.user.email;
      await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
    } catch (_) {}

    setLocalData(STORAGE_KEYS.CURRENT_USER, profile);
    return profile;
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
 * Official Editorial Board Admin Emails Whitelist
 * ONLY these 6 accounts have access to the Portal & submission management:
 * 1. ns55254@gmail.com
 * 2. shambhu.bhardwaj@gmail.com
 * 3. ankursaxena19june@gmail.com
 * 4. atulmalhotra@gmail.com
 * 5. danishather@gmail.com
 * 6. waliaishanipshita@gmail.com
 */
export const ADMIN_EMAILS = [
  'ns55254@gmail.com',
  'shambhu.bhardwaj@gmail.com',
  'ankursaxena19june@gmail.com',
  'atulmalhotra@gmail.com',
  'danishather@gmail.com',
  'waliaishanipshita@gmail.com'
];

/**
 * Check if an email belongs to the authorized Editorial Board Admins
 */
export function isAdminEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(admin => admin.trim().toLowerCase() === clean);
}

/**
 * Format and sanitize user display name from Google or email
 */
export function formatDisplayName(displayName, email) {
  if (displayName && typeof displayName === 'string' && displayName.trim()) {
    const clean = displayName.trim();
    if (clean.toLowerCase() !== 'google researcher' && clean.toLowerCase() !== 'google user') {
      return clean;
    }
  }
  if (email && typeof email === 'string') {
    const username = email.split('@')[0];
    return username
      .replace(/[._-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Author';
  }
  return 'Author';
}

/**
 * Sync Google User into Firestore (Ensures strict role separation)
 */
async function syncGoogleUser(user) {
  const userDocRef = doc(db, 'users', user.uid);
  const isEditorialAdmin = isAdminEmail(user.email);
  const assignedRole = isEditorialAdmin ? 'admin' : 'user';
  const realName = formatDisplayName(user.displayName, user.email);

  let profile = {
    uid: user.uid,
    email: user.email,
    fullName: realName,
    institution: isEditorialAdmin ? 'Bentham Science Editorial Board' : '',
    role: assignedRole,
    createdAt: serverTimestamp()
  };

  try {
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      profile = { ...userSnap.data(), ...profile };
    }
    profile.email = user.email;
    profile.role = assignedRole;
    profile.fullName = realName;
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped:", err);
  }

  setLocalData(STORAGE_KEYS.CURRENT_USER, profile);
  return profile;
}

/**
 * Check if page was loaded after a Google Redirect Sign-In
 */
export async function checkRedirectResult() {
  if (isConfigured && auth && db && window.location.protocol.startsWith('http')) {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        return await syncGoogleUser(result.user);
      }
    } catch (err) {
      console.warn('Google redirect result error:', err);
    }
  }
  return null;
}

/**
 * Sign in with Google (OAuth Popup with Redirect & Protocol Fallbacks)
 */
export async function signInWithGoogle() {
  // If running directly as local file (file:/// protocol):
  // Browsers strictly block Google OAuth popups on file:// origins.
  if (window.location.protocol === 'file:') {
    const enteredEmail = prompt(
      "Testing via file:// protocol. Google OAuth popup requires http://localhost or live website.\n\nPlease enter your email address to continue:",
      "waliaishanipshita@gmail.com"
    );
    if (!enteredEmail || !enteredEmail.trim()) {
      throw new Error("Sign-in cancelled. Please run on http://localhost or live hosting for Google OAuth.");
    }
    const cleanEmail = enteredEmail.trim();
    const defaultName = formatDisplayName(null, cleanEmail);
    const enteredName = prompt("Enter your Name:", defaultName) || defaultName;
    const isEditorialAdmin = isAdminEmail(cleanEmail);
    const mockUser = {
      uid: 'local_' + Date.now(),
      email: cleanEmail,
      fullName: enteredName.trim(),
      institution: isEditorialAdmin ? 'Bentham Science Editorial Board' : 'Author',
      role: isEditorialAdmin ? 'admin' : 'user',
      authProvider: 'google.com'
    };
    setLocalData(STORAGE_KEYS.CURRENT_USER, mockUser);
    return mockUser;
  }

  if (isConfigured && auth && db) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      return await syncGoogleUser(result.user);
    } catch (err) {
      console.warn("Live Google OAuth popup error:", err.code, err.message);

      // User closed popup
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in popup was closed before completion.');
      }

      // Popup blocked by browser: fallback to redirect sign-in
      if (err.code === 'auth/popup-blocked') {
        console.info("Popup blocked by browser. Attempting redirect sign-in...");
        await signInWithRedirect(auth, provider);
        return null;
      }

      // Unauthorized domain error with clear guidance
      if (err.code === 'auth/unauthorized-domain') {
        throw new Error(`Current domain (${window.location.hostname}) is not authorized in Firebase. Please add '${window.location.hostname}' to Firebase Authentication -> Settings -> Authorized Domains.`);
      }

      throw new Error(err.message || 'Google sign-in failed. Please try again.');
    }
  } else {
    throw new Error('Firebase Authentication is not configured.');
  }
}

/**
 * Logout current user
 */
export async function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (_) {}
  }
}

/**
 * Observe auth state changes (Instant synchronous session restore on refresh)
 */
export function subscribeToAuth(callback) {
  // 1. Purge any stale dummy mock users ("Google Researcher", "researcher.google@gmail.com")
  let savedUser = getLocalData(STORAGE_KEYS.CURRENT_USER, null);
  if (savedUser && (
    !savedUser.fullName ||
    savedUser.fullName.toLowerCase() === 'google researcher' ||
    savedUser.fullName.toLowerCase() === 'google user' ||
    savedUser.email === 'researcher.google@gmail.com' ||
    savedUser.email === 'researcher@gmail.com'
  )) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    savedUser = null;
  }

  if (savedUser) {
    savedUser.role = isAdminEmail(savedUser.email) ? 'admin' : 'user';
    callback(savedUser);
  }

  // 2. Synchronize with Firebase Auth
  if (isConfigured && auth && db) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isEditorialAdmin = isAdminEmail(firebaseUser.email);
        const realName = formatDisplayName(firebaseUser.displayName, firebaseUser.email);
        let fullUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: realName,
          role: isEditorialAdmin ? 'admin' : 'user'
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            fullUser = { ...userDoc.data(), ...fullUser };
          }
        } catch (dbErr) {
          console.warn("Could not load user doc from Firestore:", dbErr);
        }

        fullUser.email = firebaseUser.email;
        fullUser.role = isEditorialAdmin ? 'admin' : 'user';
        if (!fullUser.fullName || fullUser.fullName.toLowerCase() === 'google researcher' || fullUser.fullName.toLowerCase() === 'google user' || firebaseUser.displayName) {
          fullUser.fullName = realName;
        }

        setLocalData(STORAGE_KEYS.CURRENT_USER, fullUser);
        callback(fullUser);
      } else {
        // Firebase reported no user. If user explicitly logged out (STORAGE_KEYS.CURRENT_USER is removed),
        // notify null.
        const currentLocal = getLocalData(STORAGE_KEYS.CURRENT_USER, null);
        if (!currentLocal) {
          callback(null);
        }
      }
    });
  } else {
    if (!savedUser) {
      callback(null);
    }
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
 * Fetch all submissions created by a specific author (No composite index required)
 */
export async function getAuthorSubmissions(authorId, authorEmail = '') {
  if (isConfigured && db) {
    try {
      // Query by authorId without server orderBy to avoid Firestore composite index error
      const q = query(
        collection(db, 'submissions'),
        where('authorId', '==', authorId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Also check if any submissions exist under author's email
      if (authorEmail) {
        try {
          const qEmail = query(
            collection(db, 'submissions'),
            where('authorEmail', '==', authorEmail)
          );
          const snapEmail = await getDocs(qEmail);
          snapEmail.docs.forEach(docSnap => {
            if (!list.some(item => item.id === docSnap.id)) {
              list.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
        } catch (_) {}
      }

      // Sort in-memory: newest first
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.createdAtServer?.seconds ? a.createdAtServer.seconds * 1000 : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.createdAtServer?.seconds ? b.createdAtServer.seconds * 1000 : 0);
        return timeB - timeA;
      });
    } catch (err) {
      console.warn("Firestore getAuthorSubmissions fallback:", err);
      const localSubs = getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
      return localSubs.filter(s => s.authorId === authorId || (authorEmail && s.authorEmail === authorEmail));
    }
  } else {
    const submissions = getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
    return submissions.filter(s => s.authorId === authorId || (authorEmail && s.authorEmail === authorEmail));
  }
}

/**
 * Fetch all submissions for the Admin / Reviewer dashboard
 */
export async function getAllSubmissions() {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'submissions'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.createdAtServer?.seconds ? a.createdAtServer.seconds * 1000 : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.createdAtServer?.seconds ? b.createdAtServer.seconds * 1000 : 0);
        return timeB - timeA;
      });
    } catch (err) {
      console.warn("getAllSubmissions fallback:", err);
      return getLocalData(STORAGE_KEYS.SUBMISSIONS, []);
    }
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
