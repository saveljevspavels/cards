import {IChallengeProgress} from "../interfaces/challenge-progress.interface";
import {JsonObjectInterface} from "../interfaces/json-object.interface";

export class ChallengeProgress implements IChallengeProgress, JsonObjectInterface {
    athleteId: string;
    completedChallenges: string[];
    finishedChallenges: string[];
    challengeValues: {[key: string]: number};

    constructor(athleteId: string, completedChallenges: string[] = [], finishedChallenges: string[] = [], values: {[key: string]: number} = {}) {
        this.athleteId = athleteId;
        this.completedChallenges = completedChallenges;
        this.finishedChallenges = finishedChallenges;
        this.challengeValues = values;
    }

    static fromJSONObject(json: any): ChallengeProgress {
        return new ChallengeProgress(json['athleteId'], json['completedChallenges'], json['finishedChallenges'], json['challengeValues']);
    }

    progressChallenge(challengeId: string, value: number) {
        if(value <= 0) {
            return;
        }
        if(!this.challengeValues[challengeId]) {
            this.challengeValues[challengeId] = 0;
        }
        this.challengeValues[challengeId] += value;
    }

    toString(): string {
        return `Progress for ${this.athleteId}: ${this.completedChallenges.length} completed, ${this.finishedChallenges.length} finished, ${Object.keys(this.challengeValues).length} values`;
    }

    toJSONObject(): object {
        return {
            athleteId: this.athleteId,
            completedChallenges: this.completedChallenges,
            finishedChallenges: this.finishedChallenges,
            challengeValues: this.challengeValues
        }
    }
}