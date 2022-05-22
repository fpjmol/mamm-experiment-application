$(function() {
    const rootURL = window.location.protocol + '//' + window.location.host;
    
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
