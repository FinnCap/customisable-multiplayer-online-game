import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';

const routes: Routes = [
  { path: 'game', component: MainScreenComponent },
  { path: 'login', component: StartScreenComponent },
  // { path: 'game', component: BoardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
