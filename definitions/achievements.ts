import {ChallengeStatType, ProgressiveChallenge} from "../apps/shared/interfaces/progressive-challenge.interface";

export const ACHIEVEMENTS: ProgressiveChallenge[] = [
    {
        title: "Three meals a day",
        id: 'three_meals',
        activityType: null,
        description: "Complete a least 3 tasks in a single day",
        image: '',
        rewards: {
            coins: 0,
            experience: 0,
            points: 1
        },
        notes: [

        ],
        stat: ChallengeStatType.DAILY_COMPLETED_TASKS,
        targetValue: 3,
        evaluateImmediate: false
    },
    // {
    //     title: "Birdman I",
    //     id: 'birdman_1',
    //     activityType: null,
    //     description: "Complete 7 different bird-related tasks",
    //     image: '',
    //     rewards: {
    //         coins: 0,
    //         experience: 0,
    //         points: 1
    //     },
    //     notes: [
    //
    //     ],
    //     stat: ChallengeStatType.BIRD_TASKS,
    //     targetValue: 7,
    //     evaluateImmediate: false
    // },
    // {
    //     title: "Birdman II",
    //     id: 'birdman_2',
    //     activityType: null,
    //     description: "Complete 15 different bird-related tasks",
    //     image: '',
    //     rewards: {
    //         coins: 0,
    //         experience: 0,
    //         points: 2
    //     },
    //     notes: [
    //
    //     ],
    //     stat: ChallengeStatType.BIRD_TASKS,
    //     targetValue: 15,
    //     evaluateImmediate: false
    // },
    {
        title: "Wanderer I",
        id: 'wanderer',
        activityType: null,
        description: "Complete 7 different wanderer-related tasks",
        image: '',
        rewards: {
            coins: 0,
            experience: 0,
            points: 1
        },
        notes: [

        ],
        stat: ChallengeStatType.WANDERER_TASKS,
        targetValue: 7,
        evaluateImmediate: false
    }
] ;