export enum BOARD_KEY {
    WANDERER = 'wanderer',
    PHOTO = 'photo',
    JACK = 'jack',
    SPORT = 'sport',
    SPECIAL = 'special'
}

export const SCHEME = {
    "id": "main",
    "boards": [
        {
            "title": "Wanderer",
            "levels": [
                {
                    "cards": [
                        "start",
                        "other_coast",
                        "baywatch",
                        "work",
                        "forest"
                    ]
                },
                {
                    "cards": [
                        "sunset",
                        "pond",
                        "rain",
                        "checkpoint_ae"
                    ]
                },
                {
                    "cards": [
                        "sunrise",
                        "swamp",
                        "train",
                        "checkpoint_fj"
                    ]
                },
                {
                    "cards": [
                        "one_direction",
                        "so_interesting",
                        "hill",
                        "checkpoint_ko"
                    ]
                },
                {
                    "cards": [
                        "night",
                        "checkpoint_pt",
                        "castle",
                        "fish"
                    ]
                },
                {
                    "cards": [
                        "checkpoint_uz",
                        "park",
                        "island"
                    ]
                }
            ],
            "color": "primary",
            "icon": "geotag",
            "key": BOARD_KEY.WANDERER
        },
        {
            "levels": [
                {
                    "cards": [
                        "swimming_bird",
                        "urban_bird",
                        "homeless_cat",
                        "medium_animal",
                    ]
                },
                {
                    "cards": [
                        "forest_bird",
                        "bird_feeder",
                        "pet_dog",
                        "small_animal",
                    ]
                },
                {
                    "cards": [
                        "wetland_bird",
                        "cowboy",
                        "magpie",
                        "large_animal"
                    ]
                },
                {
                    "cards": [
                        "field_bird",
                        "goat",
                        "swan",
                        "hedgehog"
                    ]
                },
                {
                    "cards": [
                        "wading_bird",
                        "cold_blooded",
                        "wagtail",
                        "full_house"
                    ]
                },
                {
                    "cards": [
                        "birdhouse",
                        "stork",
                        "v_formation",
                        "contact_zoo"
                    ]
                },
                {
                    "cards": [
                        "heron",
                        "ferret",
                        "duck",
                        "big_bird_group"
                    ]
                }
            ],
            "icon": "camera",
            "color": "secondary-3",
            "key": BOARD_KEY.PHOTO,
            "title": "Photohunter"
        },
        {
            "key": BOARD_KEY.JACK,
            "icon": "fitness",
            "levels": [
                {
                    "cards": [
                        "cardio",
                        "game",
                        "free_weights",
                        "rolling"
                    ]
                },
                {
                    "cards": [
                        "yoga",
                        "ground_board",
                        "bodyweight",
                        "rackets_indoor"
                    ]
                },
                {
                    "cards": [
                        "motor",
                        "rowing",
                        "team_game",
                        "group_workout"
                    ]
                },
                {
                    "cards": [
                        "hike",
                        "climber",
                        "competitor",
                        "aquaman"
                    ]
                },
                {
                    "cards": [
                        "rackets_outdoor",
                        "water_boards",
                        "dance",
                        "indoor_bike"
                    ]
                },
                {
                    "cards": [
                        "martial_arts",
                        "obstacle",
                        "treadmill"
                    ]
                }
            ],
            "title": "Multitasker",
            "color": "secondary-2"
        },
        {
            "title": "Hardworker",
            "key": BOARD_KEY.SPORT,
            "levels": [
                {
                    "cards": [
                        "workout_1",
                        "workout_2",
                        "workout_3"
                    ]
                },
                {
                    "cards": [
                        "fast_1",
                        "machine_1",
                        "machine_2"
                    ]
                },
                {
                    "cards": [
                        "fast_2",
                        "machine_3",
                        "machine_4"
                    ]
                },
                {
                    "cards": [
                        "fast_3",
                        "machine_5",
                        "machine_6"
                    ]
                },
                {
                    "cards": [
                        "fast_4",
                        "machine_7",
                        "machine_8"
                    ]
                },
                {
                    "cards": [
                        "fast_5",
                        "machine_9",
                        "machine_10"
                    ]
                }
            ],
            "color": "secondary-4",
            "icon": "hammer"
        },
        {
            "levels": [
                { "cards": ["bottle",]},
                { "cards": ["creeper",]},
                { "cards": ["autograph",]},
                { "cards": ["avengers",]},
                { "cards": ["local_legend",]},
                { "cards": ["donate_clothes",]},
                { "cards": ["halloween",]},
                { "cards": ["speed_pr",]},
            ],
            "title": "Special",
            "icon": "star",
            "key": BOARD_KEY.SPECIAL,
            "color": "secondary-1"
        }
    ]
}
