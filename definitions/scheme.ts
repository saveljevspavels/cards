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
                        "full_moon",
                        "checkpoint_ko",
                        "pond",
                        "castle",
                    ]
                },
                {
                    "cards": [
                        "checkpoint_fj",
                        "rain",
                        "work",
                        "forest"
                    ]
                },
                {
                    "cards": [
                        "sunrise",
                        "swamp",
                        "3_parks",
                        "namesake_city"
                    ]
                },
                {
                    "cards": [
                        "baywatch",
                        "hill",
                        "checkpoint_ae",
                        "sunset"
                    ]
                },
                {
                    "cards": [
                        "2_cities",
                        "burning_man",
                        "island",
                        "namesake_village"
                    ]
                },
                {
                    "cards": [
                        "train",
                        "checkpoint_uz",
                        "lake",
                        "night",
                    ]
                },
                {
                    "cards": [
                        "park_100",
                        "other_coast",
                        "checkpoint_pt",
                        "favorite_place",
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
                        "game",
                        "rolling",
                        "cardio",
                        "fitness"
                    ]
                },
                {
                    "cards": [
                        "yoga",
                        "warmup",
                        "rackets",
                        "ground_boards"
                    ]
                },
                {
                    "cards": [
                        "climber",
                        "aquaman",
                        "rowing",
                        "ball_game"
                    ]
                },
                {
                    "cards": [
                        "motor",
                        "team_game",
                        "cardio_indoor",
                        "free_weights"
                    ]
                },
                {
                    "cards": [
                        "water_boards",
                        "group_workout",
                        "competitor",
                        "fitness_outdoor"
                    ]
                },
                {
                    "cards": [
                        "martial_arts",
                        "obstacle",
                        "physiotherapy",
                        "pedaling",
                    ]
                },
                {
                    "cards": [
                        "dance",
                        "roller_blades",
                        "bodyweight",
                        "cooldown",
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
                        "speed_1",
                        "elevation_1",
                        "group_run_ride",
                        "trail_run_ride",
                    ]
                },
                {
                    "cards": [
                        "speed_2",
                        "machine_1",
                        "swim_1",
                        "race",
                    ]
                },
                {
                    "cards": [
                        "machine_2",
                        "speed_3",
                        "elevation_2",
                        "group_run_ride_2",
                    ]
                },
                {
                    "cards": [
                        "machine_3",
                        "speed_4",
                        "swim_2",
                        "highway"
                    ]
                },
                {
                    "cards": [
                        "machine_4",
                        "speed_distance_1",
                        "elevation_3",
                        "group_run_ride_3",
                    ]
                },
                {
                    "cards": [
                        "machine_5",
                        "speed_5",
                        "swim_3",
                        "combo_meal"
                    ]
                },
                {
                    "cards": [
                        "machine_6",
                        "speed_6",
                        "elevation_4",
                        "speed_distance_2"
                    ]
                },
                {
                    "cards": [
                        "machine_7",
                        "machine_8",
                        "machine_9",
                        "machine_10",
                    ]
                }
            ],
            "color": "secondary-4",
            "icon": "hammer"
        },
        {
            "levels": [
                { "cards": ["so_interesting",]},
                { "cards": ["lunch",]},
                { "cards": ["emergency",]},
                { "cards": ["anthill",]},
                { "cards": ["cleaning",]},
                { "cards": ["family",]},
                { "cards": ["pitstop",]},
                { "cards": ["street_name",]},
                { "cards": ["halloween",]},
                { "cards": ["flower_field",]},
                { "cards": ["free_swim",]},
                { "cards": ["feed_homeless_cat",]},
                { "cards": ["avengers",]},
                { "cards": ["donate_clothes",]},
                { "cards": ["red_dress",]},
                { "cards": ["real_dance",]},
                { "cards": ["speed_pr",]},
                { "cards": ["bottle",]},
                { "cards": ["mushroom",]},
                { "cards": ["autograph",]},
                { "cards": ["creeper",]},
                { "cards": ["local_legend",]},
                { "cards": ["sports_car",]},
            ],
            "title": "Special",
            "icon": "star",
            "key": BOARD_KEY.SPECIAL,
            "color": "secondary-1"
        }
    ]
}
