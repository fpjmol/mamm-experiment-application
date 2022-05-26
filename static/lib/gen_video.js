$(function() {

    // CONSTANTS: ---------------------------------------------------------------

    const rootURL = window.location.protocol + '//' + window.location.host;


    // NAVIGATING BY BUTTON TO PREVENT BACK NAV: ---------------------------------

    document.getElementById('nav-button').addEventListener('click', () => {
        window.location.replace(`${rootURL}/interface-training/${participant_id}`)
    });
    

    // UPDATING STAGE: ----------------------------------------------------------

    var postable_data = {id: participant_id}
    fetch(`${rootURL}/update_stage/gen_video`, {
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
            // console.log(data)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });


    // ENABLING CONTINUE: -------------------------------------------------------
    /* Sadly, the aparat video player does not support any onStateChange listening,    
        so I had to set a timer based on the video length instead*/

    AI_timeout = setTimeout(() => { 
        document.getElementById("continue-button-highlight").classList.add('hidden');
    }, 108000);

    document.getElementById("continue-button-highlight").addEventListener('click', () => {
        document.getElementById("continue-button-highlight").classList.add('hidden');
    });
});