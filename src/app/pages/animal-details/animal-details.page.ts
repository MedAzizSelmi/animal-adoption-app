import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { Animal, AnimalService } from '../../services/animal.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-animal-details',
  templateUrl: './animal-details.page.html',
  styleUrls: ['./animal-details.page.scss'],
})
export class AnimalDetailsPage implements OnInit {
  animal$!: Observable<Animal>;
  animalId!: string;
  adoptionForm!: FormGroup;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private favoritesService: FavoritesService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {
    this.adoptionForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  async ngOnInit() {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.animal$ = this.animalService.getAnimalById(this.animalId);
    this.isFavorite = await this.favoritesService.isFavorite(this.animalId);
  }

  async toggleFavorite() {
    this.isFavorite = await this.favoritesService.toggleFavorite(this.animalId);
  }

  async openAdoptionModal() {
    const alert = await this.alertCtrl.create({
      header: 'Demande d\'adoption',
      message: 'Écrivez un message pour le refuge',
      inputs: [
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Parlez de vous et pourquoi vous souhaitez adopter...',
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Envoyer',
          handler: async (data) => {
            if (!data.message || data.message.length < 10) {
              this.showError('Le message doit contenir au moins 10 caractères.');
              return false;
            }
            await this.submitAdoptionRequest(data.message);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async submitAdoptionRequest(message: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Envoi en cours...',
    });
    await loading.present();

    try {
      const user = await this.authService.user$.pipe().toPromise();
      const animal = await this.animal$.pipe().toPromise();

      if (!user || !animal) {
        throw new Error('User or animal not found');
      }

      await this.animalService.createAdoptionRequest({
        animalId: this.animalId,
        animalName: animal.name,
        userId: user.uid,
        userEmail: user.email!,
        refugeId: animal.refugeId,
        message,
      });

      await this.notificationService.sendAdoptionRequestNotification(animal.name);
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Demande envoyée',
        message: 'Votre demande d\'adoption a été envoyée avec succès!',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      await loading.dismiss();
      this.showError('Une erreur est survenue. Veuillez réessayer.');
    }
  }

  async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }

  getAnimalAge(age: number): string {
    if (age < 1) return 'Moins d\'1 an';
    if (age === 1) return '1 an';
    return `${age} ans`;
  }
}
