export interface IChallengeProgress {
    athleteId: string;
    completedChallenges: string[];
    finishedChallenges: string[];
    challengeValues: {[key: string]: number};
}