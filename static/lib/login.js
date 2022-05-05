$(function() {
    const rootURL = window.location.protocol + '//' + window.location.host;


    // Handling Form Submission + Navigation to next page
    document.forms["login_form"].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.target).entries());

        postable_data = data

        fetch(`${rootURL}/login`, {
            method: 'POST',
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
                participant_id = data[0].email
                exp_stage = data[0].exp_stage   
                participant_type = data[0].participant_type   
                window.location.replace(`${rootURL}/join/${participant_id}/${exp_stage}/${participant_type}`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});