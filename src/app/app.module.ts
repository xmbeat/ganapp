import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundFetch } from '@ionic-native/background-fetch';
import { NotificationServiceProvider } from './../providers/globals/NotificationServiceProvider';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';


import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { Configurations } from '../providers/globals/Configurations';
import { LocalDataProvider } from '../providers/globals/LocalDataProvider';
import { ExternalDataProvider } from '../providers/globals/ExternalDataProvider';
import { Language } from '../providers/globals/Language';
import { HttpModule } from '@angular/http';
import { Camera } from '@ionic-native/camera';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { HTTP } from '@ionic-native/http';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthShortNames: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'],
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'],
      dayShortNames: ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    HTTP,
    StatusBar,
    SplashScreen,
    SQLite,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Configurations, 
    LocalDataProvider,
    ExternalDataProvider,
    Language,
    Camera,
    LocalNotifications,
    NotificationServiceProvider,
    BackgroundFetch,
    BackgroundMode,
    PhotoViewer
  ]
})
export class AppModule {}
