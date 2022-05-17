$( function() {
    const rootURL = window.location.protocol + '//' + window.location.host;

    document.forms["consent_form"].addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.replace(`${rootURL}/register`)
    });

})