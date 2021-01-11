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
  LoginPage, MainPage, HomePage, ProfilePage,
  FanPage,
  StoryPage,
  PostPage,
  RegisterPage,
  MenuRegister,
  PageHashTag,
  PageRecommended,
  SettingsFanPage, forgotPasswordPage, FulfillPage, Redirect, SettingAccount,
} from './components/components';

import { TestComponent } from './components/TestComponent.component';

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
            path: 'timeline',
            component: FanPage,
          },
          {
            path: 'general',
            component: FanPage,
          },
          {
            path: 'fulfillment',
            component: FanPage,
          },
        ]
      },
      {
        path: FanPage.PAGE_NAME + "/:id",
        component: FanPage,
        children: [
          {
            path: 'timeline',
            component: FanPage,
          },
          {
            path: 'general',
            component: FanPage,
          },
          {
            path: 'needs',
            component: FanPage,
          },
          {
            path: 'fulfillment',
            component: FanPage,
          },
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
      },
      {
        path: SettingAccount.PAGE_NAME + "/settings",
        component: SettingAccount,
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
      },
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
      {
        path: PageRecommended.PAGE_NAME,
        component: PageRecommended,
      },
      {
        path: PageRecommended.PAGE_NAME + "/:recomend",
        component: PageRecommended,
      },
      // {
      //   path: FanPage.PAGE_NAME + "/:id/:subPage",
      //   component: FanPage,
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
        path: FulfillPage.PAGE_NAME,
        component: FulfillPage,
      },
      {
        path: FulfillPage.PAGE_NAME + "/:fulfillId",
        component: FulfillPage
      },
      {
        path: Redirect.PAGE_NAME + ':id',
        component: Redirect,
      },
    ]
  },
  {
    path: 'test',
    component: TestComponent
  },
];
