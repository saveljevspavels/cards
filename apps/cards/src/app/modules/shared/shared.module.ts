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
import { SwiperComponent } from './components/swiper/swiper.component';
import { AchievementComponent } from './components/achievement/achievement.component';
import {RadioComponent} from "../../components/radio/radio.component";
import {GoogleMapComponent} from "./components/google-map/google-map.component";
import { PendingActivityComponent } from './components/pending-activity/pending-activity.component';
import { ActivityTypeIconComponent } from './components/activity-type-icon/activity-type-icon.component';
import { CompletedTaskComponent } from './components/completed-task/completed-task.component';
import { CompletedTaskViewComponent } from './components/completed-task-view/completed-task-view.component';
import { RewardBubbleComponent } from './components/reward-bubble/reward-bubble.component';
import { RewardMoneyComponent } from './components/reward-money/reward-money.component';
import { RewardPointsComponent } from './components/reward-points/reward-points.component';
import { RewardsComponent } from './components/rewards/rewards.component';
import { CircularProgressBarComponent } from './components/circular-progress-bar/circular-progress-bar.component';
import { ImageComponent } from './components/image/image.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { CountDownComponent } from './components/count-down/count-down.component';
import { RewardEnergyComponent } from './components/reward-energy/reward-energy.component';
import {EntityIdComponent} from "../../components/entity-id/entity-id.component";
import {CardPlaceholderComponent} from "./components/card/card-placeholder/card-placeholder.component";
import { CommentComponent } from './components/comment/comment.component';
import { StravaPoweredComponent } from './components/strava-powered/strava-powered.component';
import { StravaLinkComponent } from './components/strava-link/strava-link.component';
import { LinkComponent } from './components/link/link.component';
import {ProgressBarComponent} from "./components/progress-bar.component";

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
    EntityIdComponent,
    SwiperComponent,
    TierBadgeComponent,
    SvgComponent,
    PageTitleComponent,
    MobileMenuComponent,
    SvgTemplatesComponent,
    ScoreItemComponent,
    PopupComponent,
    GoogleMapComponent,
    ProgressBarComponent
]

const MODULES = [
    PipesModule,
    FileUploadModule,
    HttpClientModule,
    InputTextareaModule,
    TabMenuModule,
    ObserversModule,
]

@NgModule({
    declarations: [
        COMPS,
        AchievementComponent,
        PendingActivityComponent,
        ActivityTypeIconComponent,
        CompletedTaskComponent,
        CompletedTaskViewComponent,
        RewardBubbleComponent,
        RewardMoneyComponent,
        RewardPointsComponent,
        RewardsComponent,
        CircularProgressBarComponent,
        ImageComponent,
        GalleryComponent,
        CountDownComponent,
        RewardEnergyComponent,
        CardPlaceholderComponent,
        CommentComponent,
        StravaPoweredComponent,
        StravaLinkComponent,
        LinkComponent
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
        ActivityTypeIconComponent,
        PendingActivityComponent,
        CompletedTaskViewComponent,
        CircularProgressBarComponent,
        RewardMoneyComponent,
        RewardsComponent,
        RewardPointsComponent,
        RewardEnergyComponent,
        CardPlaceholderComponent,
        ImageComponent,
        StravaPoweredComponent,
    ],
})
export class SharedModule { }
