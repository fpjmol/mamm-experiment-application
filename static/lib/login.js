$(function() {
    // const rootURL = "http://localhost:3000"
    const rootURL = "https://mamm-experiment-application.herokuapp.com/" 

    // Handling Form Submission + Navigation to next page
    document.forms["login"].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.target).entries());
        console.log(data)

        postable_data = data

        // Handle correct fetch, with participant ID moving to /classify/:id

        fetch(`${rootURL}/register_participant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postable_data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            
            window.location.replace(`${rootURL}/generic_info`)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});