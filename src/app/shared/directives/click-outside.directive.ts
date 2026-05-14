import { Directive } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})

//Esta directiva la usaremos en los modales
export class ClickOutsideDirective {

  constructor() { }

}
