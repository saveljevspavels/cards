export class Currencies {
    coins: number;
    points: number;
    experience: number;
    chest: number;
    perk: number;
    random_perk: number;
    energy: number;
    fatigue: number;
    special_task: number;

    constructor(
        coins: number = 0,
        points: number = 0,
        experience: number = 0,
        chest: number = 0,
        perk: number = 0,
        random_perk: number = 0,
        energy: number = 0,
        fatigue: number = 0,
        special_task: number = 0
    ) {
        this.coins = coins || 0;
        this.points = points || 0;
        this.experience = experience || 0;
        this.chest = chest || 0;
        this.perk = perk || 0;
        this.random_perk = random_perk || 0;
        this.energy = energy || 0;
        this.fatigue = fatigue || 0;
        this.special_task = special_task || 0;
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

    withCoins(value: number): Currencies {
        this.coins = value;
        return this;
    }

    withEnergy(value: number): Currencies {
        this.energy = value;
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
            chest: this.chest || 0,
            perk: this.perk || 0,
            random_perk: this.random_perk || 0,
            energy: this.energy || 0,
            fatigue: this.fatigue || 0,
            special_task: this.special_task || 0
        };
    }

    static fromJSONObject(json: any): Currencies {
        if(!json) return new Currencies();
        return new Currencies(
            json['coins'],
            json['points'],
            json['experience'],
            json['chest'],
            json['perk'],
            json['random_perk'],
            json['energy'],
            json['fatigue'],
            json['special_task']
        );
    }

    isEmpty(): boolean {
        return Object.values(this).every(value => value === 0);
    }
}