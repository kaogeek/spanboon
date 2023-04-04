/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { ColorChromeModule } from 'ngx-color/chrome';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

// material ag
import {
  MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatDatepickerModule,
  MatFormFieldModule, MatRadioModule, MatSelectModule, MatSliderModule, MatGridListModule,
  MatSlideToggleModule, MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule,
  MatStepperModule, MatTabsModule, MatExpansionModule, MatButtonToggleModule,
  MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
  MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatNativeDateModule, MatCardModule, MatRippleModule
} from '@angular/material';

import { AppRoutingModule } from './app.routing';
// import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import {
  UserPage,
  UserAdminPage,
  AdminPage,
  LoginPage, FooterComponent,
  DialogDeleteComponent,
  ColumnTable,
  HashtagPage,
  PostPage,
  ConfigPage, MainPage,
  PageCategoryPage,
  AutoComp,
  VideoView,
  MenuItem,
  AutoCompSelector, FormComponent,
  TableComponent,
  testPage,
  StandardItemPage,
  StandardItemCategoryPage,
  StandardItemReqRequestPage,
  StandardItemCustomPage,
  PageObjectiveCategoryPage,
  EmergencyEventPage,
  DialogWarningComponent,
  DialogAlert,
  TodayPage,
  PageGroup
} from './components/components';
import {
  AuthenManager,
  ConfigFacade,
  LoginLogFacade,
  HashTagFacade,
  PageFacade,
  PageCategoryFacade,
  StandardItemFacade,
  StandardCustomItemFacade,
  StandardItemCategoryFacade,
  StandardItemReqRequestFacade,
  PageObjectiveCategoryFacade,
  EmergencyEventFacade,
  TodayPageFacade,
  PageGroupFacade,
  PageUserFacade,
  PageUserAdminFacade
  ,
} from './services/services';
import { UserFacade } from './services/facade/UserFacade.service';
import {
  SafePipe,
  ShortNumberPipe,
  PrefixNumberPipe
} from './components/shares/pipes/pipes';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

export const BOOSTRAP_CLASSES: any[] = [AppComponent];

const COMPONENTS: any[] = [
  AppComponent,

  // Bootstrap Classes
  FooterComponent,
  MainPage,
  AutoComp,
  VideoView,
  MenuItem,
  AutoCompSelector,
  UserPage,
  UserAdminPage,
  PostPage,
  AdminPage,
  LoginPage, PageCategoryPage,
  ConfigPage,
  HashtagPage,
  StandardItemPage,
  StandardItemCategoryPage,
  StandardItemReqRequestPage,
  StandardItemCustomPage,
  PageObjectiveCategoryPage,
  EmergencyEventPage,
  TodayPage,
  PageGroup,
  testPage,
  // component 
  FormComponent,
  DialogDeleteComponent,
  ColumnTable,
  DialogWarningComponent,
  DialogAlert,
  TableComponent,
  PageGroup
];

const PIPE_CLASSES: any[] = [
  //Pipe
  SafePipe,
  ShortNumberPipe,
  PrefixNumberPipe,
]

const SERVICE_CLASSES: any[] = [
  // manager
  AuthenManager,
  // facade
  ConfigFacade,
  LoginLogFacade,
  HashTagFacade,
  PageFacade,
  PageCategoryFacade,
  StandardItemFacade,
  StandardCustomItemFacade,
  StandardItemCategoryFacade,
  StandardItemReqRequestFacade,
  PageObjectiveCategoryFacade,
  EmergencyEventFacade,
  TodayPageFacade,
  PageGroupFacade,
  PageUserFacade,
  UserFacade,
  PageUserAdminFacade,
  // other 
  {
    provide: SWIPER_CONFIG,
    useValue: DEFAULT_SWIPER_CONFIG
  },
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CKEditorModule,
    DragDropModule,
    ColorChromeModule,
    RouterModule,
    AppRoutingModule,
    SwiperModule,
    NgbModule,
    ToastrModule.forRoot(),
    MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatDatepickerModule,
    MatFormFieldModule, MatRadioModule, MatSelectModule, MatSliderModule, MatGridListModule,
    MatSlideToggleModule, MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule,
    MatStepperModule, MatTabsModule, MatExpansionModule, MatButtonToggleModule,
    MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
    MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatNativeDateModule, MatCardModule,
    MatRippleModule
  ],
  providers: SERVICE_CLASSES,
  bootstrap: BOOSTRAP_CLASSES,
  declarations: [COMPONENTS, PIPE_CLASSES],
  entryComponents: COMPONENTS
})
export class AppModule { }
