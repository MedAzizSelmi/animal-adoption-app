import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Animal, AnimalService } from '../../services/animal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-refuge',
  templateUrl: './refuge.page.html',
  styleUrls: ['./refuge.page.scss'],
})
export class RefugePage implements OnInit {
  animals$!: Observable<Animal[]>;

  constructor(
    private animalService: AnimalService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.animals$ = this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) throw new Error('User not found');
        return this.animalService.getAnimalsByRefuge(user.uid);
      })
    );
  }

  addAnimal() {
    this.router.navigate(['/tabs/refuge/add-animal']);
  }

  async deleteAnimal(animal: Animal) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer ${animal.name} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.animalService.deleteAnimal(animal.id!);
              const successAlert = await this.alertCtrl.create({
                header: 'Succès',
                message: 'Animal supprimé avec succès.',
                buttons: ['OK'],
              });
              await successAlert.present();
            } catch (error) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Erreur',
                message: 'Une erreur est survenue lors de la suppression.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleAvailability(animal: Animal) {
    try {
      await this.animalService.updateAnimal(animal.id!, {
        available: !animal.available,
      });
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Une erreur est survenue.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  getAnimalAge(age: number): string {
    if (age < 1) return 'Moins d\'1 an';
    if (age === 1) return '1 an';
    return `${age} ans`;
  }
}
