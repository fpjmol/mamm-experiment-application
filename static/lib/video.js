$(function() {

    const rootURL = window.location.protocol + '//' + window.location.host;

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