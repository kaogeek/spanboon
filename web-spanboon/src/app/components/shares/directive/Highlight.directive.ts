/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[appHighlight]"
})
export class Highlight {
  private _content: string;
  private _searchTerm: string;
  private separatedText = [];
  private separatedSearchedText = [];
  private final = "";
  searchPattern: any;
  matchpattern: any;
  splitFlag = "";
  matchFlag = "";
  spanStart = '<span class="highlight-text-search">';
  spanEnd = "</span>";

  @Input("content")
  set content(content: string) {
    this._content = content;
  }
  get content(): string {
    return this._content;
  }

  @Input("searchTerm")
  set searchTerm(searchTerm: string) {
    this._searchTerm = searchTerm;
    this.highlight();
  }
  get searchTerm(): string {
    return this._searchTerm;
  }

  @Input() caseSensitive: boolean;

  constructor(private el: ElementRef) {
    this.caseSensitive = false;
  }

  highlight() {
    this.final = "";
    if (!this.caseSensitive) {
      this.splitFlag = "i";
      this.matchFlag = "gi";
    } else {
      this.splitFlag = "";
      this.matchFlag = "g";
    }
    this.searchPattern = new RegExp(this._searchTerm, this.splitFlag);
    this.matchpattern = new RegExp(this._searchTerm, this.matchFlag);

    if (
      this._searchTerm !== undefined &&
      this._searchTerm != null &&
      this._searchTerm.length > 0 &&
      this._searchTerm[0] !== "."
    ) {
      this.separatedText = this._content.split(this.searchPattern);
      this.separatedSearchedText = this._content.match(this.matchpattern);

      if (
        this.separatedSearchedText != null &&
        this.separatedSearchedText.length > 0
      ) {
        for (let i = 0; i < this.separatedText.length; i++) {
          if (i <= this.separatedSearchedText.length - 1) {
            this.final +=
              this.separatedText[i] +
              this.spanStart +
              this.separatedSearchedText[i] +
              this.spanEnd;
          } else {
            this.final += this.separatedText[i];
          }
        }
      }
      if (this.final.length > 0) {
        this.el.nativeElement.innerHTML = this.final;
      } else {
        this.el.nativeElement.innerText = this._content;
      }
    } else {
      this.el.nativeElement.innerText = this._content;
    }
  }
}
