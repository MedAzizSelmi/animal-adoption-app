import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
import { AnimalService } from '../../services/animal.service';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-add-animal',
  templateUrl: './add-animal.page.html',
  styleUrls: ['./add-animal.page.scss'],
  standalone: false
})
export class AddAnimalPage implements OnInit {
  animalForm!: FormGroup;
  selectedImage: string | null = null;
  imageBlob: Blob | null = null;
  userProfile: UserProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      breed: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
    });

    const user = await this.authService.user$.pipe().toPromise();
    if (user) {
      this.userProfile = await this.authService.getUserProfile(user.uid);
    }
  }

  async selectImageSource() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choisir une source',
      buttons: [
        {
          text: 'Appareil photo',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          },
        },
        {
          text: 'Galerie',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          },
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
      });

      this.selectedImage = image.dataUrl || null;

      if (image.dataUrl) {
        const response = await fetch(image.dataUrl);
        this.imageBlob = await response.blob();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Impossible de capturer l\'image.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async onSubmit() {
    if (this.animalForm.invalid || !this.imageBlob || !this.userProfile) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Veuillez remplir tous les champs et ajouter une photo.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Ajout de l\'animal...',
    });
    await loading.present();

    try {
      const user = await this.authService.user$.pipe().toPromise();
      if (!user) throw new Error('User not found');

      const imageUrl = await this.animalService.uploadImage(
        this.imageBlob,
        `${this.animalForm.value.name}.jpg`
      );

      const location = await this.getCurrentLocation();

      await this.animalService.addAnimal({
        ...this.animalForm.value,
        imageUrl,
        refugeId: user.uid,
        refugeName: this.userProfile.refugeName || 'Refuge',
        refugeAddress: this.userProfile.refugeAddress,
        refugePhone: this.userProfile.refugePhone,
        latitude: location?.latitude,
        longitude: location?.longitude,
        available: true,
      });

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Succès',
        message: 'Animal ajouté avec succès!',
        buttons: ['OK'],
      });
      await alert.present();

      this.router.navigate(['/tabs/refuge']);
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Une erreur est survenue lors de l\'ajout.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  goBack() {
    this.router.navigate(['/tabs/refuge']);
  }
}
