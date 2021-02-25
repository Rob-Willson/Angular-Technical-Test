import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionAComponent } from './option-a/option-a.component';
import { OptionBComponent } from './option-b/option-b.component';

@NgModule({
  declarations: [
    AppComponent,
    OptionAComponent,
    OptionBComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
