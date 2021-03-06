module.exports = {
    PARTICIPANT_TYPE: {
        TYPE_A: "type_a", // AMBIVALENT or FULL INFO
        TYPE_B: "type_b", // VALENT or HEATMAP ONLY
        TYPE_C: "type_c" // CONTROL
    },

    CATEGORY_TYPE: {
        PRIMING: "priming",
        EXPLAINABILITY: "explainability"
    },

    VIDEO_SUFFIX: {
        "type_a": "aef2dhv34A",
        "type_b": "b3TR298yuB",
        "type_c": "c62uiX55nC"
    },

    VIDEO_LINKS: {
        "aef2dhv34A": "3TzBq",
        "b3TR298yuBn": "Fgblj",
        "b3TR298yuBp": "HZf8B",
        "c62uiX55nC": "VKWXu"
    },

    EXPERIMENT_STAGE: {
        GEN_INFO: "gen_info",
        GEN_VIDEO: "gen_video",
        TRAINING: "interface_training",
        PRIME_VIDEO: "prime_video",
        EXP_START: "experiment_start",
        EXP_TASKS: "experiment_tasks",
        EXP_END: "experiment_end"
    },

    MAMM_IMAGE_IDS: [2, 12, 1, 7, 15, 13, 14, 6, 8, 10, 4, 9, 11, 3, 5], // Used in util function for population of user classification object

    JQUERY_CDN_URL: "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",

    TRAINING_TASK: 0 
}