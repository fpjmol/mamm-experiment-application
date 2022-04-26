$(document).on("keydown", "form", function(event) { 
    return event.key != "Enter";
});


$(function() {
    const rootURL = "http://localhost:3000"
    
    const data = { username: 'example' };

    document.forms["testForm"].addEventListener('submit', (e) => {
        console.log("submitted")
        const data = Object.fromEntries(new FormData(e.target).entries());
        console.log(data)
        
        postable_data = {name: data.name}

        fetch(`${rootURL}/insert`, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postable_data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });


    });


});



