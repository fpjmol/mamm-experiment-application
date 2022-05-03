$(function() {
    const rootURL = "http://localhost:3000"
    // const rootURL = "https://mamm-experiment-application.herokuapp.com/" 

    // Handling Form Submission + Navigation to next page
    document.forms["control_form"].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.target).entries());
        console.log(data)

        postable_data = data

        fetch(`${rootURL}/register_participant`, {
            method: 'POST',
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
                console.log('Success:', data);
                    
                window.location.replace(`${rootURL}/generic_info`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
