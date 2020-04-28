import { Directive, HostListener, Input } from "@angular/core";

@Directive({
  selector: '[linkWatcher]'
})
export class LinkWatcher {

    @Input('linkWatcher') callBack: (a: any) => void;
  
    @HostListener("click", ["$event"]) 
    onClick(e: MouseEvent){
        if((event.target as Element).tagName.toLowerCase() == 'a'){
            console.log((event.target as Element).tagName);
            this.callBack(e);
        }
    }
}