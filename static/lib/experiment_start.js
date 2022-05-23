$(() => {

    // CONSTANTS: -------------------------------------------------------------

    const rootURL = window.location.protocol + '//' + window.location.host;


    // UPDATING EXPERIMENT STAGE: ---------------------------------------------

    var putable_data = {id:participant_id}

    fetch(`${rootURL}/update_stage/experiment_start`, {
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
        } else {
            console.log(data)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    

    // BUTTON EVENT HANDLERS: -------------------------------------------------

    document.getElementById("continue-experiment-button").addEventListener("click", () => {
        document.getElementById("start-modal-super").classList.remove('hidden');
    });

    document.getElementById("start-modal-close").addEventListener("click", () => {
        document.getElementById("start-modal-super").classList.add('hidden');
    });

    document.getElementById("start-experiment-button").addEventListener("click", () => {

        const tasks_start_time = new Date().toISOString().slice(0, 19).replace('T', ' '); 

        var postable_data = {
            participant_id,
            tasks_start_time
        }

        // Sending Put Request
        fetch(`${rootURL}/save_tasks_start`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postable_data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {                    
                window.location.replace(`${rootURL}/experiment/${participant_id}`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

});