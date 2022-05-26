$(function() {

    // CONSTANTS: ---------------------------------------------------------------

    const rootURL = window.location.protocol + '//' + window.location.host;


    // NAVIGATING BY BUTTON TO PREVENT BACK NAV: ----------------------------------------

    document.getElementById('nav-button').addEventListener('click', () => {
        window.location.replace(`${rootURL}/routing/${participant_id}`)
    });
});