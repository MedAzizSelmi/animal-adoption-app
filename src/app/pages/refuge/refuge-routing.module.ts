import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RefugePage } from './refuge.page';

const routes: Routes = [
  {
    path: '',
    component: RefugePage,
  },
  {
    path: 'add-animal',
    loadChildren: () =>
      import('../add-animal/add-animal.module').then((m) => m.AddAnimalPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefugePageRoutingModule {}
