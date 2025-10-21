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
  constructor(private firestore: Firestore) {}

  // Convert image blob to base64 string
  async convertImageToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Compress image to reduce size for Firestore - FIXED VERSION
  async compressImage(file: Blob, maxWidth = 800, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Handle the case where toBlob might return null
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed - could not create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Alternative simpler compression method without canvas
  async compressImageSimple(file: Blob, quality = 0.7): Promise<Blob> {
    // For very simple compression, we can just use the original file
    // since we'll be converting to base64 anyway and Firestore has limits
    return file;
  }

  // Upload image as base64 (no Firebase Storage needed)
  async uploadImage(file: Blob, fileName: string): Promise<string> {
    try {
      console.log('Original file size:', file.size, 'bytes');

      let processedFile: Blob;

      // Try to compress the image, fallback to original if compression fails
      try {
        processedFile = await this.compressImage(file);
        console.log('Compressed file size:', processedFile.size, 'bytes');
      } catch (compressError) {
        console.warn('Image compression failed, using original file:', compressError);
        processedFile = file;
      }

      // Check file size before converting to base64
      if (processedFile.size > 500000) { // 500KB
        console.warn('Image is large, consider using a smaller image for better performance');
      }

      // Convert to base64
      const base64String = await this.convertImageToBase64(processedFile);
      console.log('Base64 string length:', base64String.length);

      // Check if base64 string is too large for Firestore (1MB limit)
      if (base64String.length > 900000) { // ~900KB to be safe
        throw new Error('L\'image est trop volumineuse même après compression. Veuillez choisir une image plus petite.');
      }

      return base64String;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Impossible de traiter l\'image');
    }
  }

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
    // Check if base64 image is too large (Firestore limit is 1MB)
    if (animal.imageUrl && animal.imageUrl.length > 900000) { // 900KB to be safe
      throw new Error('L\'image est trop volumineuse. Veuillez choisir une image plus petite.');
    }

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

  async deleteAnimal(id: string): Promise<void> {
    const animalDoc = doc(this.firestore, `animals/${id}`);
    await deleteDoc(animalDoc);

    // No need to delete from Storage since we're using base64
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