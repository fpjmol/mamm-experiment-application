$(function() {

    // CONSTANTS: ---------------------------------------------------------------

    const rootURL = window.location.protocol + '//' + window.location.host;


    // ENABLING CONTINUE: -------------------------------------------------------
    /* Sadly, the aparat video player does not support any onStateChange listening,    
        so I had to set a timer based on the video length instead*/

    switch(video_link) {
        case "3TzBq":
            var continue_time = 376000;
            break;
        case "Fgblj":
            var continue_time = 334000;
            break;
        case "HZf8B":
            var continue_time = 329000;
            break;
        case "VKWXu":
            var continue_time = 108000;
            break;
    }

    AI_timeout = setTimeout(() => { 
        document.getElementById("continue-button-highlight").classList.add('hidden');
    }, continue_time);


    // UPDATING STAGE: ----------------------------------------------------------

    postable_data = {id:participant_id}

    fetch(`${rootURL}/update_stage/prime_video`, {
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
            console.log(data)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });



});