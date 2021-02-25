import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OptionAComponent } from './option-a/option-a.component';
import { OptionBComponent } from './option-b/option-b.component';

const routes: Routes = [
  {path: '', component: OptionAComponent},
  {path: 'option-b', component: OptionBComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
