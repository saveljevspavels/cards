export class Currencies {
    coins: number;
    points: number;
    experience: number;
    chests: number;
    perks: number;
    random_perks: number;
    energy: number;
    fatigue: number;

    constructor(
        coins: number = 0,
        points: number = 0,
        experience: number = 0,
        chests: number = 0,
        perks: number = 0,
        random_perks: number = 0,
        energy: number = 0,
        fatigue: number = 0
    ) {
        this.coins = coins;
        this.points = points;
        this.experience = experience;
        this.chests = chests;
        this.perks = perks;
        this.random_perks = random_perks;
        this.energy = energy;
        this.fatigue = fatigue;
    }

    static withCoins(coins: number): Currencies {
        return new Currencies(coins);
    }

    static withPoints(points: number): Currencies {
        return new Currencies(0, points);
    }

    static withExperience(experience: number): Currencies {
        return new Currencies(0, 0, experience);
    }

    static withChests(chests: number): Currencies {
        return new Currencies(0, 0, 0, chests);
    }

    toString(): string {
        return `Currencies(${Object.entries(this).filter(([key, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
    }

    toJSONObject(): any {
        return {
            coins: this.coins,
            points: this.points,
            experience: this.experience,
            chests: this.chests,
            perks: this.perks,
            random_perks: this.random_perks,
            energy: this.energy,
            fatigue: this.fatigue
        };
    }
}