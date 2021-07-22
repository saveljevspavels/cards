import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PipesModule} from "../../pipes/pipes.module";
import {InputComponent} from "../../components/input/input.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AthleteComponent } from './components/athlete/athlete.component';
import {MenuComponent} from "../../components/menu/menu.component";
import {RouterModule} from "@angular/router";
import {HeaderComponent} from "./components/header/header.component";
import {ActivityComponent} from "./components/activity/activity.component";
import {CardComponent} from "./components/card/card.component";
import {SelectionWrapperComponent} from "./components/selection-wrapper/selection-wrapper.component";
import {ButtonModule} from "primeng/button";
import {FileUploadModule} from "primeng/fileupload";
import {HttpClientModule} from "@angular/common/http";
import {ImageUploadComponent} from "./components/image-upload/image-upload.component";
import {FileService} from "../../services/file.service";
import {InputTextareaModule} from "primeng/inputtextarea";

const COMPS = [
    InputComponent,
    AthleteComponent,
    MenuComponent,
    HeaderComponent,
    ActivityComponent,
    CardComponent,
    SelectionWrapperComponent,
    ImageUploadComponent
]

const MODULES = [
    ButtonModule,
    PipesModule,
    FileUploadModule,
    HttpClientModule,
    InputTextareaModule
]

@NgModule({
    declarations: COMPS,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ...MODULES
    ],
    exports: [
        ...COMPS,
        ...MODULES
    ],
    providers: [
        FileService
    ]
})
export class SharedModule { }
