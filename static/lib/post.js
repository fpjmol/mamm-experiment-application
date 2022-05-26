$(function() {

    // CONSTANTS: ------------------------------------------------- 

    const rootURL = window.location.protocol + '//' + window.location.host;
    const INFO_DISPLAY_TIME = 10000 // in ms
    

    // HANDLING TASKS_END_TIME: -----------------------------------

    const tasks_end_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    var putable_data = {
            participant_id,
            tasks_end_time
        }

    fetch(`${rootURL}/save_tasks_end`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(putable_data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    
    
    // Handling elements based on participant_type and category_type
    
    if (category_type === CATEGORY_TYPES.EXPLAINABILITY) {
        if(participant_type === PARTICIPANT_TYPES.TYPE_C) {
            document.getElementById("post_heatmap_usefulness_1").required = false;

            document.getElementById("post_heatmap_usefulness_textbox").classList.add("hidden")
        }

        if (participant_type === PARTICIPANT_TYPES.TYPE_B || participant_type === PARTICIPANT_TYPES.TYPE_C) {
            document.getElementById("post_contr_attr_usefulness_1").required = false;
            document.getElementById("post_prob_distr_usefulness_1").required = false;

            document.getElementById("post_contr_attr_usefulness_textbox").classList.add("hidden");
            document.getElementById("post_prob_distr_usefulness_textbox").classList.add("hidden");
        } 
    }

    // HANDLING INFO BOXES ------------------------------------------------------------

    // AI info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A || category_type === CATEGORY_TYPES.PRIMING) {
        var show_AI_info = document.getElementById("show_AI_info");
        var AI_info_box = document.getElementById("AI_info_box");

        var AI_timeout = null

        show_AI_info.addEventListener('mouseenter', () => {
            AI_info_box.classList.remove('hidden');

            AI_timeout = setTimeout(() => { // Timeout closes info window automatically
                AI_info_box.classList.add('hidden');
            }, INFO_DISPLAY_TIME);
        });

        show_AI_info.addEventListener('mouseleave', () => {
            if (AI_timeout) {
                clearTimeout(AI_timeout);
                AI_info_box.classList.add('hidden');
            }
        });
    } else {
        var AI_info = document.getElementById("AI_info");
        AI_info.classList.add('invisible');
    }


    // PD info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A || category_type === CATEGORY_TYPES.PRIMING) {
        var show_PD_info = document.getElementById("show_PD_info");
        var PD_info_box = document.getElementById("PD_info_box");

        var PD_timeout = null

        show_PD_info.addEventListener('mouseenter', () => {
            PD_info_box.classList.remove('hidden');

            PD_timeout = setTimeout(() => { // Timeout closes info window automatically
                PD_info_box.classList.add('hidden');
            }, INFO_DISPLAY_TIME);
        });

        show_PD_info.addEventListener('mouseleave', () => {
            if (PD_timeout) {
                clearTimeout(PD_timeout);
                PD_info_box.classList.add('hidden');
            }
        });
    } else {
        var PD_info = document.getElementById("PD_info");
        PD_info.classList.add('invisible');
    }
    
    // Handling Form Submission + Navigation to next page
    document.forms["post_form"].addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = Object.fromEntries(new FormData(e.target).entries());
        
        postable_data = data;
        
        const experiment_end_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

        postable_data.experiment_end_time = experiment_end_time;
        postable_data.participant_id = participant_id;
            
        fetch(`${rootURL}/final_participant_data`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postable_data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                window.alert(`Error: ${data.error}`);
                console.error('Error:', data.error);                
            } else {
                console.log('Success:', data);
                window.location.replace(`${rootURL}/experiment-end`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    
    });
});
