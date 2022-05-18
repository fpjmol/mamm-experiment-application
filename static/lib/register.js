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
    

    // Handling Form Submission + Navigation to next page
    document.forms["control_form"].addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.target).entries());

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
