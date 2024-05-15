import {IChallengeProgress} from "../interfaces/challenge-progress.interface";
import {JsonObjectInterface} from "../interfaces/json-object.interface";

export class ChallengeProgress implements IChallengeProgress, JsonObjectInterface {
    athleteId: string;
    completedChallenges: string[];
    claimedChallenges: string[];
    challengeValues: {[key: string]: number};

    constructor(athleteId: string, completedChallenges: string[] = [], claimedChallenges: string[] = [], values: {[key: string]: number} = {}) {
        this.athleteId = athleteId;
        this.completedChallenges = completedChallenges;
        this.claimedChallenges = claimedChallenges;
        this.challengeValues = values;
    }

    static fromJSONObject(json: any): ChallengeProgress {
        return new ChallengeProgress(json['athleteId'], json['completedChallenges'], json['claimedChallenges'], json['challengeValues']);
    }

    progressChallenge(challengeId: string, value: number): void {
        if(value <= 0) {
            return;
        }
        if(!this.challengeValues[challengeId]) {
            this.challengeValues[challengeId] = 0;
        }
        this.challengeValues[challengeId] += value;
    }

    completeChallenge(challengeId: string): void {
        if(this.challengeValues[challengeId] && this.completedChallenges.indexOf(challengeId) === -1) {
            this.completedChallenges.push(challengeId);
        }
    }

    toString(): string {
        return `Progress for ${this.athleteId}: ${this.completedChallenges.length} completed, ${this.claimedChallenges.length} claimed, ${Object.keys(this.challengeValues).length} values`;
    }

    toJSONObject(): object {
        return {
            athleteId: this.athleteId,
            completedChallenges: this.completedChallenges,
            claimedChallenges: this.claimedChallenges,
            challengeValues: this.challengeValues
        }
    }
}