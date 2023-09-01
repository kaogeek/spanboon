import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { LoginPage } from "src/app/components/components";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";

@Injectable()
export class BindingMemberFacade extends AbstractFacade {

  public router: Router;
  public redirection: string;
  public loginPage: LoginPage;
  protected baseURL: string;
  protected http: HttpClient;
  protected token: string;
  protected user: any;

  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  constructor(http: HttpClient, authMgr: AuthenManager,
  ) {
    super(http, authMgr);
    this.http = http;
    this.baseURL = environment.apiBaseURL;

  }

  public binding(data: any, userId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + userId + '/binding';
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data);
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
