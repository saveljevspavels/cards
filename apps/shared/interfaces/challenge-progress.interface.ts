export interface IChallengeProgress {
    athleteId: string;
    completedChallenges: string[];
    claimedChallenges: string[];
    challengeValues: {[key: string]: number};
}