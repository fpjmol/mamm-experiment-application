class ClassWatcher {

    constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.classAddedCallback = classAddedCallback
        this.classRemovedCallback = classRemovedCallback
        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch)

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, { attributes: true })
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback = mutationsList => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if(this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    if(currentClassState) {
                        this.classAddedCallback()
                    }
                    else {
                        this.classRemovedCallback()
                    }
                }
            }
        }
    }
}

$(function() {
    const rootURL = window.location.protocol + '//' + window.location.host;

    // Functions and Variables to watch Modal Trigger
    var targetNode = document.getElementById('suggestion-modal')

    function onFadeInRemoved() {
        targetNode.classList.add("fade-out")
    }

    function onFadeOutAdded() {
        setTimeout(() => {
            targetNode.classList.remove("fade-out")
        }, 1000);
    }

    function onFadeOutRemoved() {
        targetNode.classList.add("hidden")
    }

    var classWatcherOpen = new ClassWatcher(targetNode, 'fade-in', () => {}, onFadeInRemoved)
    var clasWaterClose = new ClassWatcher(targetNode, 'fade-out', onFadeOutAdded, onFadeOutRemoved)

    // Handling Modal closing
    document.getElementById("close-modal").addEventListener("click",() => {
        targetNode.classList.remove("fade-in")
    });
    
    // Handling Radiobutton Changes
    var is_exp_last_hidden = true;
    var exp_last_wrapper = document.getElementById("control_exp_last_wrapper");
    var exp_last_element = document.getElementById("control_exp_last");

    function handleRadioButtonClick(cad_exp, ai_exp) {
        if (cad_exp === 1 || ai_exp === 1 || is_exp_last_hidden) {
            exp_last_wrapper.classList.remove("invisible");
            exp_last_element.required = true;

            is_exp_last_hidden = false;

        } else {
            // Remove element from viewport
            exp_last_wrapper.classList.add("invisible")
            is_exp_last_hidden = true;

            //Reset to default value (to prevent value being captured if 2x no)
            exp_last_element.selectedIndex = 0;
            exp_last_element.required = false;
        }
    }

    var cad_rad = document.forms["control_form"].control_cad_exp
    var ai_rad = document.forms["control_form"].control_ai_exp

    var cad_exp = null;
    var ai_exp = null;

    cad_rad.forEach(input => {
        input.addEventListener('change', (input) => {
            cad_exp = parseInt(input.target.value)
            handleRadioButtonClick(cad_exp, ai_exp)
        });
    });

    ai_rad.forEach(input => {
        input.addEventListener('change', (input) => {
            ai_exp = parseInt(input.target.value)
            handleRadioButtonClick(cad_exp, ai_exp)
        });
    });

    
    
    // Handling Form Submission + Navigation to next page
    document.forms["control_form"].addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = Object.fromEntries(new FormData(e.target).entries());
        
        postable_data = data;
        
        const experiment_start_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

        postable_data.experiment_start_time = experiment_start_time
            
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
                window.alert(`Error: ${data.error}`);
                console.error('Error:', data.error);

                targetNode.classList.remove("hidden")
                targetNode.classList.add("fade-in")
                
            } else {
                console.log('Success:', data);
                window.location.replace(`${rootURL}/registration-successful/${data.participant_id}`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    
    });
});
