import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  UserCredential,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  docData,
} from '@angular/fire/firestore';
import { Observable, from, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'refuge';
  createdAt: Date;
  displayName?: string;
  refugeName?: string;
  refugeAddress?: string;
  refugePhone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = user(this.auth);
  userProfile$: Observable<UserProfile | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.userProfile$ = this.user$.pipe(
      switchMap((user) => {
        if (!user) return of(null);
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        return docData(userDoc) as Observable<UserProfile>;
      })
    );
  }

  async register(
    email: string,
    password: string,
    role: 'user' | 'refuge',
    additionalData?: {
      displayName?: string;
      refugeName?: string;
      refugeAddress?: string;
      refugePhone?: string;
    }
  ): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const userProfile: UserProfile = {
      uid: credential.user.uid,
      email: credential.user.email!,
      role,
      createdAt: new Date(),
      ...additionalData,
    };

    await setDoc(doc(this.firestore, `users/${credential.user.uid}`), userProfile);
    return credential;
  }

  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userDoc);
    return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
  }

  isUserRole(): Observable<boolean> {
    return this.userProfile$.pipe(map((profile) => profile?.role === 'user'));
  }

  isRefugeRole(): Observable<boolean> {
    return this.userProfile$.pipe(map((profile) => profile?.role === 'refuge'));
  }
}
