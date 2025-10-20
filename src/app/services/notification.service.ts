import { Injectable } from '@angular/core';
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    this.requestPermission();
  }

  async requestPermission(): Promise<void> {
    const result = await LocalNotifications.requestPermissions();
    if (result.display !== 'granted') {
      console.warn('Notification permission not granted');
    }
  }

  async sendAdoptionRequestNotification(animalName: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Demande envoyée',
            body: `Votre demande d'adoption pour ${animalName} a été envoyée avec succès!`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendNewAdoptionRequestNotification(
    animalName: string,
    userName: string
  ): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Nouvelle demande d\'adoption',
            body: `${userName} souhaite adopter ${animalName}`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}
