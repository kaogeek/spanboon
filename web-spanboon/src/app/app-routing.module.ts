/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  // Pages
  LoginPage, MainPage, HomePage, HomePageV2, ProfilePage,
  FanPage,
  StoryPage,
  PostPage,
  RegisterPage,
  MenuRegister,
  PageHashTag,
  PageRecommended,
  SettingsFanPage, forgotPasswordPage, ObjectiveTimeline,
  EmergencyEventTimeline, Redirect, SettingAccount, AboutPage, SettingsAdminRoles, SecurityInfo, Policy, TOS,
} from './components/components';

import { TestComponent } from './components/TestComponent.component';
import { RegisterPageTestComponent } from './components/RegisterPageTestComponent.component';
import { DirtyCheckGuard } from './dirty-check.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: MainPage.PAGE_NAME,
    component: MainPage,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: HomePage.PAGE_NAME,
        component: HomePage,
      },
      {
        path: ProfilePage.PAGE_NAME + "/:id",
        component: ProfilePage,
        children: [
          {
            path: "post/:postId",
            component: ProfilePage,
          },
          {
            path: 'timeline',
            component: ProfilePage,
          },
          {
            path: 'general',
            component: ProfilePage,
          },
          // {
          //   path: 'fulfillment',
          //   component: ProfilePage,
          // },
        ]
      },
      {
        path: FanPage.PAGE_NAME + "/:id",
        component: FanPage,
        // canDeactivate : [DirtyCheckGuard],
        children: [
          {
            path: "post/:postId",
            component: FanPage,
          },
          {
            path: 'timeline',
            component: FanPage,
            // canDeactivate : [DirtyCheckGuard],
          },
          {
            path: 'general',
            component: FanPage,
            // canDeactivate : [DirtyCheckGuard],
          },
          {
            path: 'needs',
            component: FanPage,
            // canDeactivate : [DirtyCheckGuard],
          },
          // {
          //   path: 'fulfillment',
          //   component: FanPage,
          //   // canDeactivate : [DirtyCheckGuard],
          // },
        ]
      },
      // {
      //   path: PostPage.PAGE_NAME + "/:postId",
      //   component: PostPage,
      // },
      {
        path: "post/:postId",
        component: FanPage,
      },
      {
        path: StoryPage.PAGE_NAME + "/:postId",
        component: StoryPage
      },
      {
        path: FanPage.PAGE_NAME + "/:id/settings",
        component: SettingsFanPage,
        children: [
          {
            path: 'account',
            component: AboutPage,
          },
          {
            path: 'roles',
            component: SettingsAdminRoles,
          },
          {
            path: 'connect',
            component: SecurityInfo,
          },
        ]
      },
      {
        path: SettingAccount.PAGE_NAME + "/settings",
        component: SettingAccount,
      },
      {
        path: ObjectiveTimeline.PAGE_NAME + "/:id",
        component: ObjectiveTimeline,
      },
      {
        path: ObjectiveTimeline.PAGE_NAME,
        redirectTo: '/home',
      },
      {
        path: EmergencyEventTimeline.PAGE_NAME + "/:id",
        component: EmergencyEventTimeline,
      },
      // {
      //   path: SettingsFanPage.PAGE_NAME,
      //   component: SettingsFanPage,      
      //   children: [
      //     {
      //       path: '**',
      //       component: SettingsFanPage,
      //     }
      //   ]
      // }, 
      {
        path: PageHashTag.PAGE_NAME,
        component: PageHashTag,
        children: [
          {
            path: PageHashTag.PAGE_NAME + "/hashtag",
            component: PageHashTag,
            children: [
              {
                path: '**',
                component: PageHashTag,
              }
            ]
          },
        ]
      },

      {
        path: PageRecommended.PAGE_NAME,
        component: PageRecommended,
      },
      // {
      //   path: PageRecommended.PAGE_NAME + "/:recomend",
      //   component: PageRecommended,
      // }, 
      {
        path: LoginPage.PAGE_NAME,
        component: LoginPage,
      },

      {
        path: forgotPasswordPage.PAGE_NAME,
        component: forgotPasswordPage,
      },
      {
        path: RegisterPage.PAGE_NAME,
        component: RegisterPage,
      },
      {
        path: TestComponent.PAGE_NAME,
        component: TestComponent,
      },
      {
        path: RegisterPageTestComponent.PAGE_NAME,
        component: RegisterPageTestComponent
      },
      {
        path: MenuRegister.PAGE_NAME,
        component: MenuRegister,
        children: [
          {
            path: RegisterPage.PAGE_NAME,
            component: RegisterPage,
          },
        ]
      },
      {
        path: RegisterPage.PAGE_NAME,
        component: RegisterPage,
      },
      {
        path: Policy.PAGE_NAME,
        component: Policy,
      },
      {
        path: TOS.PAGE_NAME,
        component: TOS,
      },
      // {
      //   path: NotificationAllPage.PAGE_NAME,
      //   component: NotificationAllPage,
      // },
      // {
      //   path: FulfillPage.PAGE_NAME,
      //   component: FulfillPage,
      //   children: [
      //     {
      //       path: ':fulfillId',
      //       component: FulfillPage
      //     }
      //   ]
      // },
      // {
      //   path: FulfillPage.PAGE_NAME + "/:fulfillId",
      //   component: FulfillPage
      // },
      {
        path: Redirect.PAGE_NAME,
        component: Redirect,
      },
      {
        path: Redirect.PAGE_NAME + ':id',
        component: Redirect,
      },
    ]
  },
  {
    path: 'test',
    component: TestComponent,
    canDeactivate: [DirtyCheckGuard]
  },
  {
    path: 'registerpage',
    component: RegisterPageTestComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }