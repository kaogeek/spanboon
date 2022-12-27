/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ViewContainerRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { NgxGalleryModule } from 'ngx-gallery';
import { GalleryModule, GALLERY_CONFIG } from '@ngx-gallery/core';
import { LightboxModule, LIGHTBOX_CONFIG } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import { ImageCropperModule } from "ngx-img-cropper";
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxTributeModule } from 'ngx-tribute';
import { environment } from '../environments/environment';
import { Ng5SliderModule } from 'ng5-slider';

import { NgOtpInputModule } from 'ng-otp-input';
import { CountdownModule } from 'ngx-countdown';


import {
  SocialLoginModule,
  GoogleLoginProvider,
  SocialAuthService
} from "angularx-social-login";

import { OverlayModule } from '@angular/cdk/overlay';
import { initializeApp } from "firebase/app";
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

initializeApp(environment.firebase);

// material ag
import {
  MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatDatepickerModule,
  MatFormFieldModule, MatRadioModule, MatSelectModule, MatSliderModule, MatGridListModule,
  MatSlideToggleModule, MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule,
  MatStepperModule, MatTabsModule, MatExpansionModule, MatButtonToggleModule,
  MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
  MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatNativeDateModule, MatCardModule, MatRippleModule, MAT_DIALOG_DATA, MatDialogRef, MatBadgeModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import {
  PrefixNumberPipe, ShortNumberPipe, SafePipe, RemoveBadWords, PipeDatetime, PipeThFormatDatetime,
  PipeThDatetime, HighlightText, ConvertTextNotification
} from './components/shares/pipes/pipes';

import {
  DebounceClickDirective,
  AutoScale,
  DragAndDrop,
  Preload,
  Shake,
  Highlight
} from './components/shares/directive/directives';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app-routing.module'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  HeaderTop,
  Footer,
  FooterMobile,

  // page
  HomePage,
  HomePageV2,
  LoginPage,
  ProfilePage,
  NotificationAllPage,
  forgotPasswordPage,
  // FanPage,
  MainPage,
  Redirect,
  DialogEditComment,
  DialogEditPost,
  RegisterPage,
  MenuRegister,
  FulfillPage,
  PageHashTag,
  PageRecommended,
  StoryPage,
  PostPage,
  SettingsFanPage,
  SettingsInfo,
  SettingsAdminRoles,
  SecurityInfo,
  AboutPage,
  Policy,
  TOS,
  // timeline 
  ObjectiveTimeline,
  EmergencyEventTimeline,
  // shares
  DialogImage,
  DialogAlert,
  DialogPassword,
  DialogManageImage,
  DialogEditProfile,
  DialogCreatePage,
  DialogDoIng,
  DialogCreateStory,
  DialogReboonTopic,
  DialogContact,
  DialogSettingDateTime,
  DialogResetForgotPassword,
  DialogFulfillAllocate,
  DialogAlertAllocate,
  DialogPreview,
  AlertComponent,
  TooltipProfile,
  PreloadCard,
  PreloadData,
  CardContact,
  NotificationCard,
  CardContentHome,
  CollapsibleHead,
  CardChatFulfill,
  ChatMessage,
  ChatFulfill,
  FulfillItemCard,
  //
  SpanBoonButton,
  ButtonSocial,
  ButtonFollow,
  Slider,
  Spinners,
  //
  NewConButtonSave,
  NewConButtonLoadMore,
  SupporterBar,
  //
  StatusBar,
  StatusBarLooking,
  HeaderSearch,
  Notification,
  ManagePage,
  MenuProfile,
  SettingAccount,
  //
  CommentPost,
  PostData,
  RepostData,
  NullPostData,
  //
  ImageCard,
  DisplayGallery,
  DisplayImage,
  NewCard,
  PostCard,
  PostSwiperCard,
  NewCards,
  ControlAction,
  IconTagCard,
  ItemCard,
  CardItem,
  CardCheckBox,
  CardConcerned,
  CardCreateStoryText,
  CardCreateStoryTextLink,
  CardCreateStoryImage,
  CardCreateStoryVideo,
  CardCreateStoryTitleText,
  NeedsCard,
  BoxPost,
  RecommendCard,
  //
  AuthenCheckPage,
  NotificationCheckPage,
  Loading,
  IconUser,
  SwiperSlider,
  AutoComp,
  DialogWarningComponent,
  DialogPost,
  FanPage,
  ChooseItem,
  DialogMedia,
  DialogFulfill,
  DialogCheckFulfill,
  DialogConfirmFulfill,
  DialogListFacebook,
  DialogPostCrad,
  FulfillItem,
  FulFillMenu,
  DialogInput,
  SnackBarFulfill,
  TagEvent,
  CardFulfillItem,
} from './components/components';

// remove when finished test
import { TestComponent } from './components/TestComponent.component';
import { RegisterPageTestComponent } from './components/RegisterPageTestComponent.component';

import {
  // Manager
  AuthenManager,
  PageUserInfo,
  ObservableManager,
  CacheConfigInfo,
  NotificationManager,
  CheckMessageManager,
  Engagement,
  SeoService,
  PostActionService,
  // Facade 
  PostFacade,
  HashTagFacade,
  EmergencyEventFacade,
  ObjectiveFacade,
  NeedsFacade,
  MainPageSlideFacade,
  AssetFacade,
  UserFacade,
  ProfileFacade,
  PageCategoryFacade,
  PageFacade,
  FotgotPasswordFacade,
  PostCommentFacade,
  SearchHistoryFacade,
  UserAccessFacade,
  NotificationFacade,
  PageContentHasTagFacade,
  EditProfileUserPageFacade,
  AccountFacade,
  ActionLogFacade,
  AllocateFacade,
  FulfillFacade,
  ChatRoomFacade,
  ChatFacade,
  AboutPageFacade,
  TwitterService,
  RecommendFacade,
  UserEngagementFacade,
  CheckMergeUserFacade,
} from './services/services';

import { registerLocaleData, DatePipe } from '@angular/common';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { LOCALE_ID } from '@angular/core';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

const cliendId = environment.googleClientId;
const googleLoginOptions = {
  scope: 'profile email',
  plugin_name: 'login' //you can use any name here
};

let socialConfig = new SocialAuthService({
  autoLogin: true,
  providers: [
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(environment.googleClientId,
        googleLoginOptions
      ),
    }
  ]
});

export function provideSocialConfig() {
  return socialConfig;
}

export const BOOSTRAP_CLASSES: any[] = [AppComponent];

const COMPONENTS: any[] = [
  // Bootstrap Classes
  AppComponent,
  HeaderTop,
  Footer,
  FooterMobile,
  // Pages
  HomePage,
  HomePageV2,
  NotificationAllPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  forgotPasswordPage,
  FanPage,
  StoryPage,
  PostPage,
  SettingsFanPage,
  AboutPage,
  Policy,
  TOS,
  SettingsInfo,
  SettingsAdminRoles,
  SecurityInfo,
  MainPage,
  MenuRegister,
  FulfillPage,
  PageHashTag,
  PageRecommended,
  Redirect,
  // timeline 
  ObjectiveTimeline,
  EmergencyEventTimeline,
  // shares
  DialogEditComment,
  DialogEditPost,
  DialogImage,
  AlertComponent,
  DialogAlert,
  DialogPassword,
  DialogManageImage,
  DialogEditProfile,
  DialogCreatePage,
  DialogDoIng,
  DialogCreateStory,
  DialogContact,
  DialogAlertAllocate,
  DialogReboonTopic,
  DialogSettingDateTime,
  DialogResetForgotPassword,
  DialogFulfill,
  DialogCheckFulfill,
  DialogConfirmFulfill,
  DialogListFacebook,
  DialogPostCrad,
  DialogInput,
  DialogFulfillAllocate,
  DialogPreview,
  TagEvent,
  TooltipProfile,
  PreloadCard,
  PreloadData,
  CardContact,
  CardContentHome,
  CollapsibleHead,
  NotificationCard,
  CardChatFulfill,
  ChatMessage,
  ChatFulfill,
  FulfillItemCard,
  //
  SpanBoonButton,
  ButtonSocial,
  ButtonFollow,
  Slider,
  Spinners,
  //
  NewConButtonSave,
  NewConButtonLoadMore,
  SupporterBar,
  //
  StatusBar,
  StatusBarLooking,
  HeaderSearch,
  Notification,
  ManagePage,
  MenuProfile,
  SettingAccount,
  //
  CommentPost,
  PostData,
  RepostData,
  NullPostData,
  //
  ImageCard,
  PostSwiperCard,
  DisplayGallery,
  DisplayImage,
  NewCard,
  PostCard,
  NewCards,
  ControlAction,
  IconTagCard,
  ItemCard,
  CardItem,
  CardFulfillItem,
  CardCheckBox,
  CardConcerned,
  CardCreateStoryText,
  CardCreateStoryTextLink,
  CardCreateStoryImage,
  CardCreateStoryVideo,
  CardCreateStoryTitleText,
  NeedsCard,
  //
  BoxPost,
  RecommendCard,
  ChooseItem,
  FulfillItem,
  FulFillMenu,
  AuthenCheckPage,
  NotificationCheckPage,
  Loading,
  IconUser,
  SwiperSlider,
  AutoComp,
  DialogWarningComponent,
  DialogPost,
  DialogMedia,
  SnackBarFulfill,
  // test
  TestComponent,
  RegisterPageTestComponent
];

const PIPE_CLASSES: any[] = [
  //Pipe
  ShortNumberPipe,
  PrefixNumberPipe,
  PipeDatetime,
  PipeThFormatDatetime,
  PipeThDatetime,
  HighlightText,
  ConvertTextNotification,
  SafePipe,
  RemoveBadWords
];

const DIRECTIVE_CLASSES: any[] = [
  //Directive
  DebounceClickDirective,
  AutoScale,
  DragAndDrop,
  Preload,
  Shake,
  Highlight
];

const SERVICE_CLASSES: any[] = [
  // manager
  AuthenManager,
  PageUserInfo,
  CheckMergeUserFacade,
  ObservableManager,
  CacheConfigInfo,
  NotificationManager,
  CheckMessageManager,
  Engagement,
  SeoService,
  PostActionService,
  // facade 
  PostFacade,
  AllocateFacade,
  HashTagFacade,
  EmergencyEventFacade,
  ObjectiveFacade,
  NeedsFacade,
  MainPageSlideFacade,
  AssetFacade,
  UserFacade,
  ProfileFacade,
  PageCategoryFacade,
  PageFacade,
  FotgotPasswordFacade,
  PostCommentFacade,
  SearchHistoryFacade,
  UserAccessFacade,
  NotificationFacade,
  PageContentHasTagFacade,
  EditProfileUserPageFacade,
  AccountFacade,
  ActionLogFacade,
  FulfillFacade,
  ChatRoomFacade,
  ChatFacade,
  AboutPageFacade,
  TwitterService,
  RecommendFacade,
  UserEngagementFacade,
  {
    provide: SocialAuthService,
    useFactory: provideSocialConfig
  },
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} },
  { provide: LOCALE_ID, useValue: "th-TH" },
  { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
  // other
  {
    provide: SWIPER_CONFIG,
    useValue: DEFAULT_SWIPER_CONFIG
  },
  {
    provide: GALLERY_CONFIG,
    useValue: {
      dots: false,
      counter: false,
      loop: false,
      imageSize: 'cover',
      thumbWidth: '160',
      thumbHeight: '120'
    }
  },
  {
    provide: LIGHTBOX_CONFIG,
    useValue: {
      keyboardShortcuts: false
    }
  },
];
registerLocaleData(localeFr, 'th-TH', localeFrExtra);

@NgModule({

  imports: [
    CountdownModule,
    BrowserModule,
    FontAwesomeModule,
    NgOtpInputModule,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    NgxPaginationModule,
    NgxGalleryModule,
    SwiperModule,
    FormsModule,
    CKEditorModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    DragDropModule,
    RouterModule.forRoot(APP_ROUTES),
    SocialLoginModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    // AutocompleteLibModule,
    // MentionModule,
    NgxTributeModule,
    Ng5SliderModule,
    SatDatepickerModule,
    SatNativeDateModule,
    ImageCropperModule,
    NgxMaterialTimepickerModule.setLocale('en-US'),
    MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatDatepickerModule,
    MatFormFieldModule, MatRadioModule, MatSelectModule, MatSliderModule, MatGridListModule,
    MatSlideToggleModule, MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule,
    MatStepperModule, MatTabsModule, MatExpansionModule, MatButtonToggleModule,
    MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
    MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatNativeDateModule, MatCardModule,
    MatRippleModule, MatBadgeModule, OverlayModule,
    CommonModule,
    ToastrModule.forRoot({
      maxOpened: 10,
      newestOnTop: true
    }), // ToastrModule added
  ],
  providers: SERVICE_CLASSES,
  bootstrap: BOOSTRAP_CLASSES,
  declarations: [COMPONENTS, PIPE_CLASSES, DIRECTIVE_CLASSES],
  entryComponents: COMPONENTS,
})
export class AppModule {

}
