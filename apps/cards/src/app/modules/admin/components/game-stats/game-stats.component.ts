import {Component, OnInit} from '@angular/core';
import {CONST} from "../../../../../../../../definitions/constants";
import {ActivityService} from "../../../../services/activity.service";
import {combineLatest} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {CardSnapshot} from "../../../../../../../shared/interfaces/card.interface";
import {filter, first} from "rxjs/operators";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {CardService} from "../../../../services/card.service";
import {AdminService} from "../../admin.service";
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {ABILITIES} from "../../../../../../../../definitions/abilities";

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.scss']
})
export class GameStatsComponent implements OnInit {

  public totalLikes: any[] = [];
  public gaveTotalLikes: any[] = [];
  public totalDistanceRun: any[] = [];
  public totalDistanceWalk: any[] = [];
  public totalDistanceBike: any[] = [];
  public totalTimeOther: any[] = [];
  public mostWanderer: any[] = [];
  public mostPhotohunter: any[] = [];
  public mostMultitasker: any[] = [];
  public coinsEarned: any[] = [];
  public mostPhotos: any[] = [];
  public mostComments: any[] = [];
  public totalCommentLength: any[] = [];

  public stats: any = {
    activityAmount: 0,
    totalTime: 0,
    totalDistance: 0,
    run: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    ride: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    walk: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    other: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    }
  };

  constructor(
      private activityService: ActivityService,
      private athleteService: AthleteService,
      private cardsService: CardService,
      private adminService: AdminService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.activityService.approvedActivities,
      this.athleteService.athletes,
      this.cardsService.cardScheme,
      this.adminService.cardFactories
    ])
        .pipe(
            filter(([activities, athletes, cardScheme, cardFactories]) => activities.length && athletes.length && cardScheme && cardFactories.length),
            first()
        )
        .subscribe(([activities, athletes, cardScheme, cardFactories]) => {
      console.log('activities', activities)
      const wandererCards = cardScheme.boards.find(scheme => scheme.key === 'wanderer')?.levels.reduce((acc: string[], level) => {return [...acc, ...level.cards]}, [])
      const photohunterCards = cardScheme.boards.find(scheme => scheme.key === 'photo')?.levels.reduce((acc: string[], level) => {return [...acc, ...level.cards]}, [])
      const multitaskerCards = cardScheme.boards.find(scheme => scheme.key === 'jack')?.levels.reduce((acc: string[], level) => {return [...acc, ...level.cards]}, [])
      const allCards = [
          ...(wandererCards || []),
          ...(photohunterCards || []),
          ...(multitaskerCards || [])
      ]

      this.totalLikes = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if (activity.athlete.id.toString() === athlete.id) {
              acc = acc + activity.gameData.cardSnapshots.reduce((snapshotAcc: number, snapshot: CardSnapshot) => snapshotAcc + (snapshot.likes || []).length, 0)
            }
            return acc;
          }, 0)
        }
      });
      this.mostPhotos = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if (activity.athlete.id.toString() === athlete.id) {
              acc = acc + activity.gameData.cardSnapshots.reduce((snapshotAcc: number, snapshot: CardSnapshot) => snapshotAcc + (snapshot.attachedImages || []).length, 0)
            }
            return acc;
          }, 0)
        }
      });
      this.mostComments = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if (activity.athlete.id.toString() === athlete.id) {
              acc = acc + activity.gameData.comments !== '' ? 1 : 0;
            }
            return acc;
          }, 0)
        }
      });
      this.totalCommentLength = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if (activity.athlete.id.toString() === athlete.id) {
              acc = acc + (activity.gameData.comments?.length || 0);
            }
            return acc;
          }, 0)
        }
      });
      this.gaveTotalLikes = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            acc = acc + activity.gameData.cardSnapshots.reduce((snapshotAcc: number, snapshot: CardSnapshot) => ((snapshot.likes || []).indexOf(athlete.id) !== -1) ? 1 : 0, 0)
            return acc;
          }, 0)
        }
      });

      this.mostWanderer = athletes.map((athlete: Athlete) => {
        return {
          name: athlete.name,
          value: athlete.cards.claimed.reduce((acc: number, cardId: string) => {
            if(wandererCards?.indexOf(cardId) !== -1) {
              acc++;
            }
            return acc;
          }, 0)
        }
      });

      this.mostPhotohunter = athletes.map((athlete: Athlete) => {
        return {
          name: athlete.name,
          value: athlete.cards.claimed.reduce((acc: number, cardId: string) => {
            if(photohunterCards?.indexOf(cardId) !== -1) {
              acc++;
            }
            return acc;
          }, 0)
        }
      });

      this.mostMultitasker = athletes.map((athlete: Athlete) => {
        return {
          name: athlete.name,
          value: athlete.cards.claimed.reduce((acc: number, cardId: string) => {
            if(multitaskerCards?.indexOf(cardId) !== -1) {
              acc++;
            }
            return acc;
          }, 0)
        }
      });
      this.totalDistanceRun = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if((activity.athlete.id).toString() === athlete.id && StaticValidationService.normalizeActivityType(activity) === CONST.ACTIVITY_TYPES.RUN) {
              acc = acc + activity.distance
            }
            return acc;
          }, 0)
        }
      });
      this.totalDistanceBike = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if((activity.athlete.id).toString() === athlete.id && StaticValidationService.normalizeActivityType(activity) === CONST.ACTIVITY_TYPES.RIDE) {
              acc = acc + activity.distance
            }
            return acc;
          }, 0)
        }
      });
      this.totalDistanceWalk = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if((activity.athlete.id).toString() === athlete.id && StaticValidationService.normalizeActivityType(activity) === CONST.ACTIVITY_TYPES.WALK) {
              acc = acc + activity.distance
            }
            return acc;
          }, 0)
        }
      });
      this.totalTimeOther = athletes.map((athlete: any) => {
        return {
          name: athlete.name,
          value: activities.reduce((acc: number, activity: any) => {
            if((activity.athlete.id).toString() === athlete.id && StaticValidationService.normalizeActivityType(activity) === CONST.ACTIVITY_TYPES.OTHER) {
              acc = acc + activity.elapsed_time
            }
            return acc;
          }, 0)
        }
      });

      this.coinsEarned = athletes.map((athlete: Athlete) => {
        return {
          name: athlete.name,
          value: (athlete?.currencies.coins || 0)
              + Object.values(athlete.unlocks).reduce((acc: number, value: number) => {
            switch (value) {
              case 1: return acc + 5;
              case 2: return acc + 15;
              case 3: return acc + 30;
              case 4: return acc + 50;
              default: return acc;
            }
          }, 0)
          + athlete.usedAbilities.reduce((acc: number, abilityKey: AbilityKey) => acc + (ABILITIES.find(ability => ability.key === abilityKey)?.coinsCost || 0), 0)
          + athlete.cards.claimed.reduce((acc: number, cardId: string) => acc + ((allCards.indexOf(cardId) !== -1) ? 1 : 0), 0)
        }
      });
      console.log('athletes', athletes)




      this.stats.activityAmount = activities.length;
      this.stats.totalTime = activities.reduce((acc: any, i: any) => {
        acc = Math.floor(acc + i.elapsed_time);
        return acc;
      }, 0);
      this.stats.totalDistance = activities.reduce((acc: any, i: any) => {
        acc = Math.floor(acc + i.distance);
        return acc;
      }, 0);
      activities.forEach((activity: any) => {
        const type = Object.values(CONST.ACTIVITY_TYPES).find((activityType) => activity.type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1) || CONST.ACTIVITY_TYPES.OTHER;
        this.stats[type].activityAmount = this.stats[type].activityAmount + 1;
        this.stats[type].totalDistance = this.stats[type].totalDistance + activity.distance;
        this.stats[type].totalTime = this.stats[type].totalTime + activity.elapsed_time;
      })
    })
  }

}
