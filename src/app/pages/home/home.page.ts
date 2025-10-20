import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Animal, AnimalService } from '../../services/animal.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  animals$!: Observable<Animal[]>;
  favorites: string[] = [];

  constructor(
    private animalService: AnimalService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.animals$ = this.animalService.getAnimals();
    this.favorites = await this.favoritesService.getFavorites();
  }

  async toggleFavorite(event: Event, animalId: string) {
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(animalId);
    this.favorites = await this.favoritesService.getFavorites();
  }

  isFavorite(animalId: string): boolean {
    return this.favorites.includes(animalId);
  }

  viewAnimal(animalId: string) {
    this.router.navigate(['/tabs/home/animal-details', animalId]);
  }

  getAnimalAge(age: number): string {
    if (age < 1) return 'Moins d\'1 an';
    if (age === 1) return '1 an';
    return `${age} ans`;
  }
}
