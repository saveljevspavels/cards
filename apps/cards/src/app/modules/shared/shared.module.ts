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
import {FileUploadModule} from "primeng/fileupload";
import {HttpClientModule} from "@angular/common/http";
import {ImageUploadComponent} from "./components/image-upload/image-upload.component";
import {FileService} from "../../services/file.service";
import {InputTextareaModule} from "primeng/inputtextarea";
import {BaseWorkoutInfoComponent} from "./components/base-workout-info/base-workout-info.component";
import {SelectComponent} from "../../components/select/select.component";
import {TextareaComponent} from "../../components/textarea/textarea.component";
import {ValidatorComponent} from "./components/validator/validator.component";
import {CheckboxComponent} from "../../components/checkbox/checkbox.component";
import {TabMenuModule} from "primeng/tabmenu";
import {ContentComponent} from "../../components/content/content.component";
import { CollapsibleComponent } from './components/collapsible/collapsible.component';
import {ObserversModule} from "@angular/cdk/observers";
import { ButtonComponent } from './components/button/button.component';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { SvgComponent } from './components/svg/svg.component';
import { SvgTemplatesComponent } from './components/svg-templates/svg-templates.component';
import { ScoreItemComponent } from './components/scores/score-item/score-item.component';
import { PopupComponent } from './components/popup/popup.component';
import { TierBadgeComponent } from './components/tier-badge/tier-badge.component';
import {SwiperModule} from "swiper/angular";
import { SwiperComponent } from './components/swiper/swiper.component';
import { AchievementComponent } from './components/achievement/achievement.component';
import {RadioComponent} from "../../components/radio/radio.component";

const COMPS = [
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    RadioComponent,
    AthleteComponent,
    MenuComponent,
    HeaderComponent,
    ActivityComponent,
    CardComponent,
    SelectionWrapperComponent,
    ImageUploadComponent,
    BaseWorkoutInfoComponent,
    ValidatorComponent,
    ContentComponent,
    ButtonComponent,
    CollapsibleComponent,
    TextareaComponent,
    SwiperComponent,
    TierBadgeComponent,
    SvgComponent,
    PageTitleComponent,
    MobileMenuComponent,
    SvgTemplatesComponent,
    ScoreItemComponent,
    PopupComponent,
]

const MODULES = [
    PipesModule,
    FileUploadModule,
    HttpClientModule,
    InputTextareaModule,
    TabMenuModule,
    ObserversModule,
    SwiperModule
]

@NgModule({
    declarations: [
        COMPS,
        AchievementComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ...MODULES,
    ],
    exports: [
        ...COMPS,
        ...MODULES,
        AchievementComponent,
    ],
    providers: [
        FileService
    ]
})
export class SharedModule { }
