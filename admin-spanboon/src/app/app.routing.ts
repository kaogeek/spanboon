/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import {
  MainPage, 
  StandardItemCategoryPage, 
  UserAdminPage, 
  PostPage, 
  EmergencyEventPage, 
  PageObjectiveCategoryPage, 
  StandardItemCustomPage, 
  StandardItemReqRequestPage, 
  HashtagPage, 
  testPage, 
  StandardItemPage, 
  LoginPage,
  ConfigPage, 
  UserPage, 
  AdminPage, 
  PageCategoryPage,
  TodayPage
} from './components/components';
const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: LoginPage.PAGE_NAME,
    component: LoginPage
  },
  {
    path: 'main',
    component: MainPage,
    children: [
      {
        path: PageObjectiveCategoryPage.PAGE_NAME,
        component: PageObjectiveCategoryPage
      },
      {
        path: PostPage.PAGE_NAME,
        component: PostPage
      },
      {
        path: EmergencyEventPage.PAGE_NAME,
        component: EmergencyEventPage
      },
      {
        path:TodayPage.PAGE_NAME,
        component:TodayPage
      },
      {
        path: StandardItemCategoryPage.PAGE_NAME,
        component: StandardItemCategoryPage
      },
      {
        path: StandardItemReqRequestPage.PAGE_NAME,
        component: StandardItemReqRequestPage
      },
      {
        path: StandardItemCustomPage.PAGE_NAME,
        component: StandardItemCustomPage
      },
      {
        path: PageCategoryPage.PAGE_NAME,
        component: PageCategoryPage
      },
      {
        path: ConfigPage.PAGE_NAME,
        component: ConfigPage
      },
      {
        path: StandardItemPage.PAGE_NAME,
        component: StandardItemPage
      },
      {
        path: HashtagPage.PAGE_NAME,
        component: HashtagPage
      },
      {
        path: UserPage.PAGE_NAME,
        component: UserPage
      },
      {
        path: AdminPage.PAGE_NAME,
        component: AdminPage
      },
      {
        path: UserAdminPage.PAGE_NAME,
        component: UserAdminPage
      },
    ]
  },
  {
    path: 'test',
    component: testPage,
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
