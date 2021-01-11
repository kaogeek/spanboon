/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input } from '@angular/core';

export interface VideoForm {
  width: string;
  height: string;
  class: string | string[];
}

@Component({
  selector: 'admin-video-view',
  templateUrl: './VideoView.component.html'
})
export class VideoView implements OnInit {

  @Input()
  public videoForm: VideoForm;
  @Input()
  public url: string;

  constructor() {
  }

  public ngOnInit() {
  }

  public getVideo(): string {
    return '<iframe width="100%" height="100%" src="' + this.url + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  }
}
