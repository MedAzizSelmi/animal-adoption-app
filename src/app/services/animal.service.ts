import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface Animal {
  id?: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  description: string;
  imageUrl: string;
  refugeId: string;
  refugeName: string;
  refugeAddress?: string;
  refugePhone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Timestamp;
  available: boolean;
}

export interface AdoptionRequest {
  id?: string;
  animalId: string;
  animalName: string;
  userId: string;
  userEmail: string;
  refugeId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  constructor(private firestore: Firestore, private storage: Storage) {}

  getAnimals(): Observable<Animal[]> {
    const animalsRef = collection(this.firestore, 'animals');
    const q = query(animalsRef, where('available', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<Animal[]>;
  }

  getAnimalById(id: string): Observable<Animal> {
    const animalDoc = doc(this.firestore, `animals/${id}`);
    return docData(animalDoc, { idField: 'id' }) as Observable<Animal>;
  }

  getAnimalsByRefuge(refugeId: string): Observable<Animal[]> {
    const animalsRef = collection(this.firestore, 'animals');
    const q = query(animalsRef, where('refugeId', '==', refugeId));
    return collectionData(q, { idField: 'id' }) as Observable<Animal[]>;
  }

  async addAnimal(animal: Omit<Animal, 'id' | 'createdAt'>): Promise<string> {
    const animalsRef = collection(this.firestore, 'animals');
    const docRef = await addDoc(animalsRef, {
      ...animal,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async updateAnimal(id: string, data: Partial<Animal>): Promise<void> {
    const animalDoc = doc(this.firestore, `animals/${id}`);
    await updateDoc(animalDoc, data);
  }

  async deleteAnimal(id: string, imageUrl: string): Promise<void> {
    const animalDoc = doc(this.firestore, `animals/${id}`);
    await deleteDoc(animalDoc);

    if (imageUrl) {
      try {
        const imageRef = ref(this.storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  }

  async uploadImage(file: Blob, fileName: string): Promise<string> {
    const timestamp = Date.now();
    const storageRef = ref(this.storage, `animals/${timestamp}_${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async createAdoptionRequest(
    request: Omit<AdoptionRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<string> {
    const requestsRef = collection(this.firestore, 'adoptionRequests');
    const docRef = await addDoc(requestsRef, {
      ...request,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  getAdoptionRequestsByUser(userId: string): Observable<AdoptionRequest[]> {
    const requestsRef = collection(this.firestore, 'adoptionRequests');
    const q = query(requestsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<AdoptionRequest[]>;
  }

  getAdoptionRequestsByRefuge(refugeId: string): Observable<AdoptionRequest[]> {
    const requestsRef = collection(this.firestore, 'adoptionRequests');
    const q = query(requestsRef, where('refugeId', '==', refugeId));
    return collectionData(q, { idField: 'id' }) as Observable<AdoptionRequest[]>;
  }
}
