import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PGLSearchSelectComponent, PGLOptionDef, PGLEmptyOptionDef, PGLLoadingOptionDef } from './pgl-search-select.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatIconModule} from '@angular/material/icon';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatButtonModule} from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [PGLSearchSelectComponent, PGLOptionDef, PGLEmptyOptionDef, PGLLoadingOptionDef],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatOptionModule
  ],
  exports: [PGLSearchSelectComponent, PGLOptionDef, PGLEmptyOptionDef, PGLLoadingOptionDef]
})
export class PglSearchSelectModule { }
