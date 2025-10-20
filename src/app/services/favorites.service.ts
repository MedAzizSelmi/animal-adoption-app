import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favorites';

  async getFavorites(): Promise<string[]> {
    const { value } = await Preferences.get({ key: this.FAVORITES_KEY });
    return value ? JSON.parse(value) : [];
  }

  async addFavorite(animalId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(animalId)) {
      favorites.push(animalId);
      await Preferences.set({
        key: this.FAVORITES_KEY,
        value: JSON.stringify(favorites),
      });
    }
  }

  async removeFavorite(animalId: string): Promise<void> {
    let favorites = await this.getFavorites();
    favorites = favorites.filter((id) => id !== animalId);
    await Preferences.set({
      key: this.FAVORITES_KEY,
      value: JSON.stringify(favorites),
    });
  }

  async isFavorite(animalId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(animalId);
  }

  async toggleFavorite(animalId: string): Promise<boolean> {
    const isFav = await this.isFavorite(animalId);
    if (isFav) {
      await this.removeFavorite(animalId);
      return false;
    } else {
      await this.addFavorite(animalId);
      return true;
    }
  }
}
