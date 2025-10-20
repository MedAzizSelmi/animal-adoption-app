import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Animal, AnimalService } from '../../services/animal.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userProfile$!: Observable<UserProfile | null>;
  favoriteAnimals$!: Observable<Animal[]>;

  constructor(
    private authService: AuthService,
    private animalService: AnimalService,
    private favoritesService: FavoritesService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.userProfile$ = this.authService.userProfile$;

    const favorites = await this.favoritesService.getFavorites();
    this.favoriteAnimals$ = this.animalService.getAnimals().pipe(
      map((animals) => animals.filter((animal) => favorites.includes(animal.id!)))
    );
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Déconnexion',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }

  viewAnimal(animalId: string) {
    this.router.navigate(['/tabs/home/animal-details', animalId]);
  }

  async removeFavorite(animalId: string) {
    await this.favoritesService.removeFavorite(animalId);
    const favorites = await this.favoritesService.getFavorites();
    this.favoriteAnimals$ = this.animalService.getAnimals().pipe(
      map((animals) => animals.filter((animal) => favorites.includes(animal.id!)))
    );
  }

  getAnimalAge(age: number): string {
    if (age < 1) return 'Moins d\'1 an';
    if (age === 1) return '1 an';
    return `${age} ans`;
  }
}
