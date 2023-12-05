import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appHorizontalScroll]',
})
export class HorizontalScrollDirective {
    constructor(private element: ElementRef) { }

    @HostListener('wheel', ['$event'])
    public onScroll(event: WheelEvent) {
        this.element.nativeElement.scrollLeft += event.deltaY;
        this.element.nativeElement.scrollLeft += event.deltaX;
        event.preventDefault();
    }
}