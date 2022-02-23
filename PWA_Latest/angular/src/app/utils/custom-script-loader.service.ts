import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomScriptLoaderService {

  constructor() { }

  private scripts: ScriptItem[] = [];

  public loadScript(script: ScriptItem): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {

      let isScriptLoaded: boolean = this.checkIfScriptLoaded(script.name);
      // Complete if already loaded
      if (isScriptLoaded) {
        observer.next(true);
        observer.complete();
      }
      else {
        // Load the script
        let scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = script.src;

        scriptElement.onload = () => {
          // Add the script
          this.scripts = [...this.scripts, script];
          observer.next(true);
          observer.complete();
        };

        scriptElement.onerror = (error: any) => {
          observer.error("Couldn't load script " + script.src);
        };

        document.getElementsByTagName('body')[0].appendChild(scriptElement);
      }
    });
  }


  checkIfScriptLoaded(scriptName): boolean {

    let existingScript = this.scripts.find(s => s.name == scriptName);

    // Complete if already loaded
    if (existingScript) {
      return true;
    }

    return false;
  }
}

export class ScriptItem {
  name: string;
  src: string;
}