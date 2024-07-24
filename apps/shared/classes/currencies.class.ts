export class Currencies {
    coins: number;
    points: number;
    experience: number;
    chests: number;
    perks: number;
    random_perks: number;
    energy: number;
    fatigue: number;
    special_tasks: number;

    constructor(
        coins: number = 0,
        points: number = 0,
        experience: number = 0,
        chests: number = 0,
        perks: number = 0,
        random_perks: number = 0,
        energy: number = 0,
        fatigue: number = 0,
        special_tasks: number = 0
    ) {
        this.coins = coins || 0;
        this.points = points || 0;
        this.experience = experience || 0;
        this.chests = chests || 0;
        this.perks = perks || 0;
        this.random_perks = random_perks || 0;
        this.energy = energy || 0;
        this.fatigue = fatigue || 0;
        this.special_tasks = special_tasks || 0;
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

    static withPerks(perks: number): Currencies {
        return new Currencies(0, 0, 0, 0, perks);
    }

    static withEnergy(energy: number): Currencies {
        return new Currencies(0, 0, 0, 0, 0, 0, energy);
    }

    withExperience(value: number): Currencies {
        this.experience = value;
        return this;
    }

    toString(): string {
        return `Currencies(${Object.entries(this).filter(([key, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
    }

    toJSONObject(): any {
        return {
            coins: this.coins || 0,
            points: this.points || 0,
            experience: this.experience || 0,
            chests: this.chests || 0,
            perks: this.perks || 0,
            random_perks: this.random_perks || 0,
            energy: this.energy || 0,
            fatigue: this.fatigue || 0,
            special_tasks: this.special_tasks || 0
        };
    }

    static fromJSONObject(json: any): Currencies {
        if(!json) return new Currencies();
        return new Currencies(
            json['coins'],
            json['points'],
            json['experience'],
            json['chests'],
            json['perks'],
            json['random_perks'],
            json['energy'],
            json['fatigue'],
            json['special_tasks']
        );
    }

    isEmpty(): boolean {
        return Object.values(this).every(value => value === 0);
    }
}