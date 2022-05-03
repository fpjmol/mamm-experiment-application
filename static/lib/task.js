$(() => {

    // CONSTANTS: -------------------------------------------------------------
    
    // const rootURL = "http://localhost:3000"
    const rootURL = "https://mamm-experiment-application.herokuapp.com/" 
    const INFO_DISPLAY_TIME = 10000 // in ms
    const TASK_START_TIME = new Date().getTime();

    // GLOBAL VARIABLES: ------------------------------------------------------

    var total_time_ai_prediction = 0;
    var total_time_class_submit = 0;

    var total_time_birads_expl = 0;
    var time_birads_expl_start = null;
    var total_visits_birads_expl = 0;

    var is_first_birads_class = true;
    var total_time_first_birads_class = 0;
    var total_birads_class_changes = 0;

    if (participant_type !== PARTICIPANT_TYPES.TYPE_C) { // Only exists for type A & B participants
        var total_time_heatmap = 0;
        var time_heatmap_start = null;
        var time_heatmap_end = null;
        var total_visits_heatmap = 0;
    }

    if (participant_type === PARTICIPANT_TYPES.TYPE_A) { // Only exists for type A participants
        var total_time_contr_attr = 0;
        var time_contr_attr_start = null;
        var total_visits_contr_attr = 0;

        var total_time_prob_distr = 0;
        var time_prob_distr_start = null;
        var total_visits_prob_distr = 0;
    }

    // RADIOBUTTON CHANGES: ---------------------------------------------------

    function handleRadioButtonClick() {
        if (is_first_birads_class) {
            const time_first_birads_class_end = new Date().getTime();
            is_first_birads_class = false;
            total_time_first_birads_class = time_first_birads_class_end - TASK_START_TIME;
        } else {
            total_birads_class_changes++;
        }
    }

    document.querySelectorAll("input[type=radio]").forEach((input) => {
        input.addEventListener('click', handleRadioButtonClick);
    });


    // TOGGLING HEATMAP: ------------------------------------------------------
    var show_heatmap_button = document.getElementById("show_heatmap_button");

    if (participant_type !== PARTICIPANT_TYPES.TYPE_C) { // Only exists for type A & B participants
        var hide_heatmap_button = document.getElementById("hide_heatmap_button");

        var mammogram_image = document.getElementById("mamm_img");
        var heatmap_image = document.getElementById("heatmap_img");

        show_heatmap_button.addEventListener('click', () => {
            show_heatmap_button.classList.add('hidden');
            hide_heatmap_button.classList.remove('hidden');

            mammogram_image.classList.add('hidden');
            heatmap_image.classList.remove('hidden');

            total_visits_heatmap ++;
            time_heatmap_start = new Date().getTime();
            time_heatmap_end = null;
        });

        hide_heatmap_button.addEventListener('click', () => {
            time_heatmap_end = new Date().getTime();

            hide_heatmap_button.classList.add('hidden');
            show_heatmap_button.classList.remove('hidden');

            heatmap_image.classList.add('hidden');
            mammogram_image.classList.remove('hidden');

            total_time_heatmap += (time_heatmap_end - time_heatmap_start)
        });
    } else {
        show_heatmap_button.classList.add('invisible');
    }

    // SHOWING AI SUGGESTION: -------------------------------------------------

    var show_AI_button = document.getElementById("show_AI_button");
    var AI_suggestion = document.getElementById("AI_suggestion");

    show_AI_button.addEventListener('click', () => {
        const time_ai_prediction_end = new Date().getTime();

        show_AI_button.classList.add('hidden');
        AI_suggestion.classList.remove('hidden');

        total_time_ai_prediction = time_ai_prediction_end - TASK_START_TIME;
    });


    // SHOWING INFO BOXES: ---------------------------------------------------

    // BIRADS info box: ===========

    var show_BIRADS_info = document.getElementById("show_BIRADS_info");
    var BIRADS_info_box = document.getElementById("BIRADS_info_box");

    show_BIRADS_info.addEventListener('mouseenter', () => {
        time_birads_expl_start = new Date().getTime();
        
        BIRADS_info_box.classList.remove('hidden');

        total_visits_birads_expl++;
    });

    show_BIRADS_info.addEventListener('mouseleave', () => {
        const time_birads_expl_end = new Date().getTime();

        BIRADS_info_box.classList.add('hidden');

        total_time_birads_expl += (time_birads_expl_end - time_birads_expl_start)
    });


    // AI info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A) {
        var show_AI_info = document.getElementById("show_AI_info");
        var AI_info_box = document.getElementById("AI_info_box");

        var AI_timeout = null

        show_AI_info.addEventListener('mouseenter', () => {
            time_contr_attr_start = new Date().getTime();

            AI_info_box.classList.remove('hidden');

            AI_timeout = setTimeout(() => { // Timeout closes info window automatically
                const time_contr_attr_end = new Date().getTime();

                AI_info_box.classList.add('hidden');

                total_time_contr_attr += (time_contr_attr_end - time_contr_attr_start)
            }, INFO_DISPLAY_TIME);

            total_visits_contr_attr++;
        });

        show_AI_info.addEventListener('mouseleave', () => {
            if (AI_timeout) {
                const time_contr_attr_end = new Date().getTime();

                clearTimeout(AI_timeout);
                AI_info_box.classList.add('hidden');

                total_time_contr_attr += (time_contr_attr_end - time_contr_attr_start)
            }
        });
    } else {
        var AI_info = document.getElementById("AI_info");
        AI_info.classList.add('invisible');
    }


    // PD info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A) {
        var show_PD_info = document.getElementById("show_PD_info");
        var PD_info_box = document.getElementById("PD_info_box");

        var PD_timeout = null

        show_PD_info.addEventListener('mouseenter', () => {
            time_prob_distr_start = new Date().getTime();

            PD_info_box.classList.remove('hidden');

            PD_timeout = setTimeout(() => { // Timeout closes info window automatically
                const time_prob_distr_end = new Date().getTime();

                PD_info_box.classList.add('hidden');

                total_time_prob_distr += (time_prob_distr_end - time_prob_distr_start)
            }, INFO_DISPLAY_TIME);

            total_visits_prob_distr++;
        });

        show_PD_info.addEventListener('mouseleave', () => {
            if (PD_timeout) {
                const time_prob_distr_end = new Date().getTime();

                clearTimeout(PD_timeout);
                PD_info_box.classList.add('hidden');

                total_time_prob_distr += (time_prob_distr_end - time_prob_distr_start)
            }
        });
    } else {
        var PD_info = document.getElementById("PD_info");
        PD_info.classList.add('invisible');
    }

    // SUBMITTING TASK FORM: -------------------------------------------------

    document.forms["birads_classification_form"].addEventListener('submit', (e) => {
        e.preventDefault();

        // Calculate total task time until submission
        const time_class_submit_end = new Date().getTime();
        total_time_class_submit = time_class_submit_end - TASK_START_TIME;

        // Retrieve BIRADS_classification data from form
        const data = Object.fromEntries(new FormData(e.target).entries());
        birads_classification = parseInt(data.birads_class)

        // Preparing measurement data
        var measured_data = {
            participant_id,
            task_id,
            participant_type,
            birads_classification,
            total_time_ai_prediction,
            total_time_class_submit,
            total_time_birads_expl,
            total_visits_birads_expl,
            total_time_first_birads_class,
            total_birads_class_changes,
            classification_obj
        } 

        if (participant_type !== PARTICIPANT_TYPES.TYPE_C) { // Only exists for type A & B participants
            
            if (time_heatmap_end == null && total_time_heatmap != 0) { // Handles case where heatmap is still open upon submit
                time_heatmap_end = new Date().getTime();
                total_time_heatmap += (time_heatmap_end - time_heatmap_start)
            }

            measured_data.total_time_heatmap = total_time_heatmap;
            measured_data.total_visits_heatmap = total_visits_heatmap;
        }

        if (participant_type === PARTICIPANT_TYPES.TYPE_A) { // Only exists for type A participants
            measured_data.total_time_prob_distr = total_time_prob_distr
            measured_data.total_visits_prob_distr = total_visits_prob_distr
            
            measured_data.total_time_contr_attr = total_time_contr_attr
            measured_data.total_visits_contr_attr = total_visits_contr_attr
        }

        // Sending Post Request

        fetch(`${rootURL}/save_task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(measured_data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                console.log('Success:', data);
                    
                window.location.replace(`${rootURL}/experiment/${participant_id}`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        

    });
});