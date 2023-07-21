import { Component, OnInit } from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {GameService} from "../../../../services/game.service";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
    public allRules: RuleSet[] = [
        {
            title: 'General',
            rules: [
                'It’s a competition, where you engage in various physical activities to complete tasks and earn points',
                'You have a number of tasks to choose from, each task requires you record a certain activity through Strava',
                'Strava activities are automatically synchronized and will appear on your Dashboard',
                'To get points you should submit one of your activities and select which task you want to complete. Attach photo if necessary'
            ]
        },
        {
            title: 'Tasks',
            rules: [
                'To activate the task you need to spend 1 energy. All energy is restored at midnight',
                'At the beginning you have limited amount of tasks. You can unlock more for coins',
                'Each task has its activity requirement, your activity should pass that requirement',
                'Most of the times you should have a photo attachment for the task upon submission',
                'If task requires to run "3km in a forest" it should be clearly visible in GPS that you did at least 3km in a forest',
                'If you see any task misuses/cheating you can Report that task. If the report is accepted, task will be rejected for the athlete'
            ]
        },
        {
            title: 'Time limited tasks',
            rules: [
                'Time limited task is the same for everybody, and is changed every 8 hours',
                'You don\'t have to spend energy to activate it',
                'Time limited task does not give victory points, but it gives more coins instead',
                'When you complete the task, new one will appear as scheduled'
            ]
        },
        {
            title: 'Basic Task',
            rules: [
                'You can always submit your activity to "Basic Task" to get bonus coins',
                'Any activities that are small/not suitable for a regular Tasks could be submitted as a Basic Task',
                'You will get 1 coin for each full cycle of a Basic Task',
                'If your activity is longer than Task requirements - all the overflow automatically go to the Basic Task',
            ]
        },
        {
            title: 'Abilities',
            rules: [
                'You have a set of special abilities available in your profile',
                'Each ability is usable only once',
            ]
        },
        {
            title: 'Energy',
            rules: [
                `${RULES.ENERGY.TIMED_RESTORE} energy points are restored at midnight`,
                `If you have any unspent energy, you will get ${RULES.COINS.PER_ENERGY_CONVERSION} bonus coins for each energy`
            ]
        }
    ]



    public tiers = [
        `Easy (${ConstService.RULES.LEVELS["0"].min}-${ConstService.RULES.LEVELS["0"].max} points)`,
        `Normal (${ConstService.RULES.LEVELS["1"].min}-${ConstService.RULES.LEVELS["1"].max} points)`,
        `Hard (${ConstService.RULES.LEVELS["2"].min}-${ConstService.RULES.LEVELS["2"].max} points)`,
        `Very Hard (${ConstService.RULES.LEVELS["3"].min}-${ConstService.RULES.LEVELS["3"].max} points)`,
        `Help me Jesus (${ConstService.RULES.LEVELS["4"].min}+ points)`,
    ]

    constructor(private gameService: GameService) { }

    public creatures = {
        animals: [],
        birds: []
    }

    ngOnInit(): void {
        this.gameService.getCreatures().subscribe((res: any) => {
            this.creatures = res;
        })
    }

}

interface RuleSet {
    title: string;
    rules: string[];
}