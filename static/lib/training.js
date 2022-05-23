$(() => {

    // CONSTANTS: -------------------------------------------------------------
    
    const rootURL = window.location.protocol + '//' + window.location.host;
    const INFO_DISPLAY_TIME = 10000 // in ms
    const TRAINING_START_TIME = new Date().getTime();


    // UPDATING EXPERIMENT STAGE: ---------------------------------------------

    postable_data = {id:participant_id}

    fetch(`${rootURL}/update_stage/interface_training`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postable_data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log('Something went wrong while updating the experiment stage...')
            console.error('Error:', data.error);                
        } else {
            console.log(data)
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });


    // SETTING BUTTON HIGHLIGHTS: ---------------------------------------------
    // Button highlights are additionally used to protect against button use before explanation
    
    function matchSize(highlight_object, target_object) {
        highlight_object.style.height = target_object.offsetHeight;
        highlight_object.style.width = target_object.offsetWidth;
    }

    matchSize(document.getElementById('expl-heatmap-highlight'), document.getElementById('show_heatmap_button'))
    matchSize(document.getElementById('expl-AI-highlight'), document.getElementById('show_AI_button'))
    matchSize(document.getElementById('expl-submit-highlight'), document.getElementById('task_submit_button'))

    matchSize(document.getElementById('expl-AI_info-highlight'), document.getElementById('show_AI_info'))
    matchSize(document.getElementById('expl-BIRADS-highlight'), document.getElementById('show_BIRADS_info'))


    // MAMMOGRAM MODAL: -------------------------------------------------------
    
    // OPENING/CLOSING MODAL ======================
    var mamm_modal = document.getElementById("mammogram-modal");

    document.getElementById("mamm_img").addEventListener('click', () => {
        mamm_modal.classList.remove('hidden');
    });

    document.getElementById("heatmap_img").addEventListener('click', () => {
        mamm_modal.classList.remove('hidden');
    });

    document.getElementById("mammogram-modal-close").addEventListener('click', () => {
        mamm_modal.classList.add('hidden');
    });

    // HANDLING ZOOMING ===========================
    var container = document.getElementById("zoomable-container");
    var zoom = 1;
    const ZOOM_SPEED = 0.1;

    document.addEventListener("wheel", function(e) {  
        
        if (e.deltaY > 0) {
            if (zoom >= 0.3) {    
                container.style.transform = `scale(${zoom -= ZOOM_SPEED})`;  
            }
        } else{    
            container.style.transform = `scale(${zoom += ZOOM_SPEED})`;  
        }

    });

    // HANDLING PANNING ===========================
    function hasTouch() {
        return 'ontouchstart' in document.documentElement;
    }

    var img_ele = null,
        has_reset = false,
        event_start = hasTouch() ? 'touchstart' : 'mousedown',
        event_move = hasTouch() ? 'touchmove' : 'mousemove',
        event_end = hasTouch() ? 'touchend' : 'mouseup';
    // console.log(event_start + "|" + event_move + "|" + event_end);

    document.getElementById("mammogram-modal-reset").addEventListener('click', () => {
        // Reset Zoom
        zoom = 1
        container.style.transform = `scale(${zoom})`; 
        has_reset = true;

        // Reset img position        
        img_ele = null;

        var mamm_img = document.getElementById("mamm_img_modal")
        var heatmap_img = document.getElementById("heatmap_img_modal")

        mamm_img.style.left = '0px';
        mamm_img.style.top = '0px';

        heatmap_img.style.left = '0px';
        heatmap_img.style.top = '0px';
    });

    function start_drag(event) {
        var x_cursor = hasTouch() ? event.changedTouches[0].clientX : event.clientX,
            y_cursor = hasTouch() ? event.changedTouches[0].clientY : event.clientY;

        img_ele = this;
        
        if (zoom == 1 && !has_reset) {
            x_img_ele = x_cursor - (img_ele.offsetLeft + 302);
        } else {
            x_img_ele = x_cursor - img_ele.offsetLeft;
        }   
        y_img_ele = y_cursor - img_ele.offsetTop;

        // console.log("start drag");
    }

    function stop_drag() {
      img_ele = null;
    //   console.log("stop drag");
    }

    function while_drag(event) {
        var x_cursor = hasTouch() ? event.changedTouches[0].clientX : event.clientX,
            y_cursor = hasTouch() ? event.changedTouches[0].clientY : event.clientY;

        if (img_ele !== null) {
            img_ele.style.left = (x_cursor - x_img_ele) + 'px';
            img_ele.style.top = (y_cursor - y_img_ele) + 'px';
            // console.log('dragging > img_left:' + img_ele.style.left + ' | img_top: ' + img_ele.style.top);
        }
    }

    document.getElementById('mamm_img_modal').addEventListener(event_start, start_drag);
    document.getElementById('heatmap_img_modal').addEventListener(event_start, start_drag);
    document.getElementById('mammogram-modal-content').addEventListener(event_move, while_drag);
    document.getElementById('mammogram-modal-content').addEventListener(event_end, stop_drag);

    // TOGGLING HEATMAP INSIDE MODAL: -----------------------------------------

    var show_heatmap_button_modal = document.getElementById("show_heatmap_button_modal");
    var hide_heatmap_button_modal = document.getElementById("hide_heatmap_button_modal");

    if (participant_type !== PARTICIPANT_TYPES.TYPE_C || category_type === CATEGORY_TYPES.PRIMING) { // Only exists for type A & B participants
        var mammogram_image = document.getElementById("mamm_img");
        var heatmap_image = document.getElementById("heatmap_img");
        
        var mammogram_image_modal = document.getElementById("mamm_img_modal");
        var heatmap_image_modal = document.getElementById("heatmap_img_modal");

        show_heatmap_button_modal.addEventListener('click', () => {
            show_heatmap_button_modal.classList.add('hidden');
            show_heatmap_button.classList.add('hidden');
            hide_heatmap_button_modal.classList.remove('hidden');
            hide_heatmap_button.classList.remove('hidden');

            mammogram_image.classList.add('hidden');
            mammogram_image_modal.classList.add('hidden');
            heatmap_image.classList.remove('hidden');
            heatmap_image_modal.classList.remove('hidden');

            heatmap_image_modal.style.left = mammogram_image_modal.style.left;
            heatmap_image_modal.style.top = mammogram_image_modal.style.top;

            total_visits_heatmap ++;
            time_heatmap_start = new Date().getTime();
            time_heatmap_end = null;
        });

        hide_heatmap_button_modal.addEventListener('click', () => {
            time_heatmap_end = new Date().getTime();

            hide_heatmap_button_modal.classList.add('hidden');
            hide_heatmap_button.classList.add('hidden');
            show_heatmap_button_modal.classList.remove('hidden');
            show_heatmap_button.classList.remove('hidden');

            heatmap_image.classList.add('hidden');
            heatmap_image_modal.classList.add('hidden');
            mammogram_image.classList.remove('hidden');
            mammogram_image_modal.classList.remove('hidden');

            mammogram_image_modal.style.left = heatmap_image_modal.style.left;
            mammogram_image_modal.style.top = heatmap_image_modal.style.top;

            total_time_heatmap += (time_heatmap_end - time_heatmap_start)
        });
    } else {
        show_heatmap_button_modal.classList.add('invisible');
    }


    // TOGGLING HEATMAP: ------------------------------------------------------

    var show_heatmap_button = document.getElementById("show_heatmap_button");
    var hide_heatmap_button = document.getElementById("hide_heatmap_button");
    
    var mammogram_image = document.getElementById("mamm_img");
    var heatmap_image = document.getElementById("heatmap_img");
    
    var mammogram_image_modal = document.getElementById("mamm_img_modal");
    var heatmap_image_modal = document.getElementById("heatmap_img_modal");

    var first_heatmap_toggle = true;

    function show_heatmap() { // Defined as separate function for execution in cycleToNextExplanationModal()
        show_heatmap_button.classList.add('hidden');
        show_heatmap_button_modal.classList.add('hidden');
        hide_heatmap_button.classList.remove('hidden');
        hide_heatmap_button_modal.classList.remove('hidden');

        mammogram_image.classList.add('hidden');
        mammogram_image_modal.classList.add('hidden');
        heatmap_image.classList.remove('hidden');
        heatmap_image_modal.classList.remove('hidden');

        heatmap_image_modal.style.left = mammogram_image_modal.style.left;
        heatmap_image_modal.style.top = mammogram_image_modal.style.top;

        first_heatmap_toggle = false;
    }

    if (participant_type !== PARTICIPANT_TYPES.TYPE_C || category_type === CATEGORY_TYPES.PRIMING) { // Only exists for type A & B participants


        show_heatmap_button.addEventListener('click', () => {
            if (first_heatmap_toggle) {
                cycleToNextExplanationModal({ // Executes explanation flow behavior
                    current_modal_object: document.getElementById('expl-heatmap'),
                    current_target_object: document.getElementById('show_heatmap_button'),
                    current_highlight: document.getElementById('expl-heatmap-highlight'),
                    current_highlight_class: 'highlighted-blue',
                    current_modal_name: 'expl-heatmap',
                    next_modal_object: document.getElementById('expl-patient'),
                    next_target_object: document.getElementById('patient_info'),
                    next_highlight: document.getElementById('expl-patient-highlight'),
                    next_highlight_class: 'highlighted-clear',
                    target_type_is_button: false
                }, show_heatmap // Executes default button behavior
                );
            } else {
                show_heatmap()
            }

        });

        hide_heatmap_button.addEventListener('click', () => {
            hide_heatmap_button.classList.add('hidden');
            hide_heatmap_button_modal.classList.add('hidden');
            show_heatmap_button.classList.remove('hidden');
            show_heatmap_button_modal.classList.remove('hidden');

            heatmap_image.classList.add('hidden');
            heatmap_image_modal.classList.add('hidden');
            mammogram_image.classList.remove('hidden');
            mammogram_image_modal.classList.remove('hidden');
        });
    } else {
        show_heatmap_button.classList.add('invisible');
        document.getElementById('expl-heatmap-highlight').classList.add('invisible');
    }


    // SHOWING AI SUGGESTION: -------------------------------------------------

    var show_AI_button = document.getElementById("show_AI_button");
    var AI_suggestion = document.getElementById("AI_suggestion");

    function show_AI_suggestion() {
        show_AI_button.classList.add('hidden');
        AI_suggestion.classList.remove('hidden');
    };

    show_AI_button.addEventListener('click', () => {
        cycleToNextExplanationModal({ // Executes explanation flow behavior
            current_modal_object: document.getElementById('expl-AI'),
            current_target_object: document.getElementById('show_AI_button'),
            current_highlight: document.getElementById('expl-AI-highlight'),
            current_highlight_class: 'highlighted-blue',
            current_modal_name: 'expl-AI',
            next_modal_object: document.getElementById('expl-AI_suggestion'),
            next_target_object: document.getElementById('AI_suggestion'),
            next_highlight: document.getElementById('expl-AI_suggestion-highlight'),
            next_highlight_class: 'highlighted-clear',
            target_type_is_button: true
        }, show_AI_suggestion // Executes default button behavior
        );
    });


    // SHOWING INFO BOXES: ---------------------------------------------------

    // BIRADS info box: ===========

    var show_BIRADS_info = document.getElementById("show_BIRADS_info");
    var BIRADS_info_box = document.getElementById("BIRADS_info_box");

    show_BIRADS_info.addEventListener('mouseenter', () => {  
        BIRADS_info_box.classList.remove('hidden');
    });

    show_BIRADS_info.addEventListener('mouseleave', () => {
        BIRADS_info_box.classList.add('hidden');
    });


    // AI info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A || category_type === CATEGORY_TYPES.PRIMING) {
        var show_AI_info = document.getElementById("show_AI_info");
        var AI_info_box = document.getElementById("AI_info_box");

        var AI_timeout = null

        show_AI_info.addEventListener('mouseenter', () => {
            AI_info_box.classList.remove('hidden');

            AI_timeout = setTimeout(() => { // Timeout closes info window automatically
                AI_info_box.classList.add('hidden');
            }, INFO_DISPLAY_TIME);
        });

        show_AI_info.addEventListener('mouseleave', () => {
            if (AI_timeout) {
                clearTimeout(AI_timeout);
                AI_info_box.classList.add('hidden');
            }
        });
    } else {
        var AI_info = document.getElementById("AI_info");
        AI_info.classList.add('invisible');
    }


    // PD info box: ================

    if (participant_type === PARTICIPANT_TYPES.TYPE_A || category_type === CATEGORY_TYPES.PRIMING) {
        var show_PD_info = document.getElementById("show_PD_info");
        var PD_info_box = document.getElementById("PD_info_box");

        var PD_timeout = null

        show_PD_info.addEventListener('mouseenter', () => {
            PD_info_box.classList.remove('hidden');

            PD_timeout = setTimeout(() => { // Timeout closes info window automatically
                PD_info_box.classList.add('hidden');
            }, INFO_DISPLAY_TIME);
        });

        show_PD_info.addEventListener('mouseleave', () => {
            if (PD_timeout) {
                clearTimeout(PD_timeout);
                PD_info_box.classList.add('hidden');
            }
        });
    } else {
        var PD_info = document.getElementById("PD_info");
        PD_info.classList.add('invisible');
    }


    // HANDLING EXPLANATION FLOW: --------------------------------------------

    // Support Functions =============================

    function setModalEventListeners(parameters, optional_parameter = null) {
        document.getElementById(parameters.current_modal_name + '-close').addEventListener('click', () => {
            cycleToNextExplanationModal(parameters, optional_parameter);
        });
    
        document.getElementById(parameters.current_modal_name + '-continue').addEventListener('click', () => {
            cycleToNextExplanationModal(parameters, optional_parameter);
        });
    }

    function cycleToNextExplanationModal(parameters, optional_parameter) {
        if (optional_parameter !== null) { // Executes default button behavior if included
            optional_parameter()
        }

        if (parameters.current_highlight !== null) { // For first & last modal case
            parameters.current_highlight.classList.add('hidden');
            parameters.current_highlight.classList.remove(parameters.current_highlight_class);
            
            // Removing eventlisteners
            var cloned_element = parameters.current_highlight.cloneNode(true);
            parameters.current_highlight.parentNode.replaceChild(cloned_element, parameters.current_highlight)
        }

        if (parameters.current_target_object !== null) { // For first & last modal case
            // Removing eventlisteners
            parameters.current_target_object.removeEventListener('mouseleave', () => {
                parameters.next_highlight.classList.remove('hidden');
            });
        }

        parameters.current_modal_object.classList.add('hidden');

        if (parameters.next_modal_object !== null) { // For penultimate modal case
            parameters.next_modal_object.classList.remove('hidden'); 

            if(parameters.next_target_object !== null) { // For last modal case
                parameters.next_highlight.style.height = parameters.next_target_object.clientHeight;
                parameters.next_highlight.style.width = parameters.next_target_object.clientWidth;

                if (!parameters.target_type_is_button) {
                    parameters.next_highlight.classList.remove('hidden');
                }

                parameters.next_highlight.classList.add(parameters.next_highlight_class);

                parameters.next_highlight.addEventListener('mouseenter', () => {
                    parameters.next_highlight.classList.add('hidden');
                });

                parameters.next_target_object.addEventListener('mouseleave', () => {
                    parameters.next_highlight.classList.remove('hidden');
                });
            }
        }
    }
    
    // expl-start modal to expl-mammogram =================
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-start-super'),
        current_target_object: null,
        current_highlight: null,
        current_highlight_class: null,
        current_modal_name: 'expl-start',
        next_modal_object: document.getElementById('expl-mammogram'),
        next_target_object: document.getElementById('mamm_img'),
        next_highlight: document.getElementById('expl-mammogram-highlight'),
        next_highlight_class: 'highlighted-blue',
        target_type_is_button: false
    });

    // expl-start modal to expl-AI modal ==================
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-mammogram'),
        current_target_object: document.getElementById('mamm_img'),
        current_highlight: document.getElementById('expl-mammogram-highlight'),
        current_highlight_class: 'highlighted-blue',
        current_modal_name: 'expl-mammogram',
        next_modal_object: document.getElementById('expl-AI'),
        next_target_object: document.getElementById('show_AI_button'),
        next_highlight: document.getElementById('expl-AI-highlight'),
        next_highlight_class: 'highlighted-blue',
        target_type_is_button: true,
    });

    // expl-AI modal to expl-AI_suggestion modal ==========
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-AI'),
        current_target_object: document.getElementById('show_AI_button'),
        current_highlight: document.getElementById('expl-AI-highlight'),
        current_highlight_class: 'highlighted-blue',
        current_modal_name: 'expl-AI',
        next_modal_object: document.getElementById('expl-AI_suggestion'),
        next_target_object: document.getElementById('AI_suggestion'),
        next_highlight: document.getElementById('expl-AI_suggestion-highlight'),
        next_highlight_class: 'highlighted-clear',
        target_type_is_button: false
    }, show_AI_suggestion // Includes default button behavior of show-AI-button
    ); 


    // HANDLING CATEGORY/TYPE SPECIFIC MODALS =============

    if (participant_type === PARTICIPANT_TYPES.TYPE_A || category_type === CATEGORY_TYPES.PRIMING) {
        // expl-AI_suggestion modal to expl-PD_info modal =====
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-AI_suggestion'),
            current_target_object: document.getElementById('AI_suggestion'),
            current_highlight: document.getElementById('expl-AI_suggestion-highlight'),
            current_highlight_class: 'highlighted-clear',
            current_modal_name: 'expl-AI_suggestion',
            next_modal_object: document.getElementById('expl-PD_info'),
            next_target_object: document.getElementById('show_PD_info'),
            next_highlight: document.getElementById('expl-PD_info-highlight'),
            next_highlight_class: 'highlighted-more-blue',
            target_type_is_button: true
        }
        ); 

        // expl-PD_info modal to expl-AI_info modal ===========
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-PD_info'),
            current_target_object: document.getElementById('show_PD_info'),
            current_highlight: document.getElementById('expl-PD_info-highlight'),
            current_highlight_class: 'highlighted-more-blue',
            current_modal_name: 'expl-PD_info',
            next_modal_object: document.getElementById('expl-AI_info'),
            next_target_object: document.getElementById('show_AI_info'),
            next_highlight: document.getElementById('expl-AI_info-highlight'),
            next_highlight_class: 'highlighted-more-blue',
            target_type_is_button: true
        }
        ); 

        // expl-AI_info modal to expl-heatmap modal ===========
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-AI_info'),
            current_target_object: document.getElementById('show_AI_info'),
            current_highlight: document.getElementById('expl-AI_info-highlight'),
            current_highlight_class: 'highlighted-more-blue',
            current_modal_name: 'expl-AI_info',
            next_modal_object: document.getElementById('expl-heatmap'),
            next_target_object: document.getElementById('show_heatmap_button'),
            next_highlight: document.getElementById('expl-heatmap-highlight'),
            next_highlight_class: 'highlighted-blue',
            target_type_is_button: true
        }
        ); 

        // expl_heatmap modal to expl_patient modal ===========
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-heatmap'),
            current_target_object: document.getElementById('show_heatmap_button'),
            current_highlight: document.getElementById('expl-heatmap-highlight'),
            current_highlight_class: 'highlighted-blue',
            current_modal_name: 'expl-heatmap',
            next_modal_object: document.getElementById('expl-patient'),
            next_target_object: document.getElementById('patient_info'),
            next_highlight: document.getElementById('expl-patient-highlight'),
            next_highlight_class: 'highlighted-clear',
            target_type_is_button: false
        }, show_heatmap
        ); 

    } else if (participant_type === PARTICIPANT_TYPES.TYPE_B) {

        // expl-AI_suggestion modal to expl-heatmap modal =====
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-AI_suggestion'),
            current_target_object: document.getElementById('AI_suggestion'),
            current_highlight: document.getElementById('expl-AI_suggestion-highlight'),
            current_highlight_class: 'highlighted-clear',
            current_modal_name: 'expl-AI_suggestion',
            next_modal_object: document.getElementById('expl-heatmap'),
            next_target_object: document.getElementById('show_heatmap_button'),
            next_highlight: document.getElementById('expl-heatmap-highlight'),
            next_highlight_class: 'highlighted-blue',
            target_type_is_button: true
        }
        ); 

        // expl_heatmap modal to expl_patient modal ===========
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-heatmap'),
            current_target_object: document.getElementById('show_heatmap_button'),
            current_highlight: document.getElementById('expl-heatmap-highlight'),
            current_highlight_class: 'highlighted-blue',
            current_modal_name: 'expl-heatmap',
            next_modal_object: document.getElementById('expl-patient'),
            next_target_object: document.getElementById('patient_info'),
            next_highlight: document.getElementById('expl-patient-highlight'),
            next_highlight_class: 'highlighted-clear',
            target_type_is_button: false
        }, show_heatmap
        ); 

    } else {
        // expl-AI_suggestion modal to expl-patient modal =====
        setModalEventListeners({
            current_modal_object: document.getElementById('expl-AI_suggestion'),
            current_target_object: document.getElementById('AI_suggestion'),
            current_highlight: document.getElementById('expl-AI_suggestion-highlight'),
            current_highlight_class: 'highlighted-clear',
            current_modal_name: 'expl-AI_suggestion',
            next_modal_object: document.getElementById('expl-patient'),
            next_target_object: document.getElementById('patient_info'),
            next_highlight: document.getElementById('expl-patient-highlight'),
            next_highlight_class: 'highlighted-clear',
            target_type_is_button: false
        }
        ); 
    }

    // expl_patient modal to expl_nr_left modal ===========
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-patient'),
        current_target_object: document.getElementById('patient_info'),
        current_highlight: document.getElementById('expl-patient-highlight'),
        current_highlight_class: 'highlighted-clear',
        current_modal_name: 'expl-patient',
        next_modal_object: document.getElementById('expl-nr_left'),
        next_target_object: document.getElementById('task_counter'),
        next_highlight: document.getElementById('expl-nr_left-highlight'),
        next_highlight_class: 'highlighted-clear',
        target_type_is_button: false
    }
    );

    // expl-nr_left modal to expl-classification ==========  
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-nr_left'),
        current_target_object: document.getElementById('task_counter'),
        current_highlight: document.getElementById('expl-nr_left-highlight'),
        current_highlight_class: 'highlighted-clear',
        current_modal_name: 'expl-nr_left',
        next_modal_object: document.getElementById('expl-classification'),
        next_target_object: document.getElementById('classification_menu_mid'),
        next_highlight: document.getElementById('expl-classification-highlight'),
        next_highlight_class: 'highlighted-clear',
        target_type_is_button: false
    }
    );

    // expl-classification modal to expl-birads ===========
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-classification'),
        current_target_object: document.getElementById('classification_menu_mid'),
        current_highlight: document.getElementById('expl-classification-highlight'),
        current_highlight_class: 'highlighted-clear',
        current_modal_name: 'expl-classification',
        next_modal_object: document.getElementById('expl-birads'),
        next_target_object: document.getElementById('show_BIRADS_info'),
        next_highlight: document.getElementById('expl-BIRADS-highlight'),
        next_highlight_class: 'highlighted-more-blue',
        target_type_is_button: true
    }
    );

    // expl-birads modal to expl-submit ===================
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-birads'),
        current_target_object: document.getElementById('show_BIRADS_info'),
        current_highlight: document.getElementById('expl-BIRADS-highlight'),
        current_highlight_class: 'highlighted-more-blue',
        current_modal_name: 'expl-birads',
        next_modal_object: document.getElementById('expl-submit'),
        next_target_object: document.getElementById('task_submit_button'),
        next_highlight: document.getElementById('expl-submit-highlight'),
        next_highlight_class: 'highlighted-blue',
        target_type_is_button: true
    }
    );
    
    // expl-submit modal to expl-end ======================
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-submit'),
        current_target_object: document.getElementById('task_submit_button'),
        current_highlight: document.getElementById('expl-submit-highlight'),
        current_highlight_class: 'highlighted-blue',
        current_modal_name: 'expl-submit',
        next_modal_object: document.getElementById('expl-end-super'),
        next_target_object: null,
        next_highlight: null,
        next_highlight_class: null,
        target_type_is_button: false
    }
    );
    
    // expl-end Final =====================================
    setModalEventListeners({
        current_modal_object: document.getElementById('expl-end-super'),
        current_target_object: null,
        current_highlight: null,
        current_highlight_class: null,
        current_modal_name: 'expl-end',
        next_modal_object: null,
        next_target_object: null,
        next_highlight: null,
        next_highlight_class: null,
        target_type_is_button: false
    }
    );

    // HANDLING SPOOF TASK FORM: -------------------------------------------------

    document.forms["birads_classification_form"].addEventListener('submit', (e) => {
        e.preventDefault();

        // Calculate total task time until submission
        const TRAINING_END_TIME = new Date().getTime();
        total_training_time = TRAINING_END_TIME - TRAINING_START_TIME;

        // Populate Postable Data Object
        var postable_data = {
            participant_id, 
            total_training_time
        }
        
        // Sending Put Request
        fetch(`${rootURL}/save_training`, {
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
                window.location.replace(`${rootURL}/pre-experiment/${participant_id}`)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });


        
    });
});