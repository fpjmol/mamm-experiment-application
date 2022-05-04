const PORT = process.env.PORT || 3000

const express = require('express')
const cookieParser = require('cookie-parser')
const async = require('async')
const constants = require('./constants')
const utils = require('./utils')
const favicon = require('serve-favicon')

const app = express();

app.use(favicon(__dirname + '/static/img/favicon.ico'))
app.use(cookieParser())

const mysql = require('mysql2');

// SETTINGS FOR localhost DB:

// const db = mysql.createConnection({
//     user: 'root',
//     host: 'localhost',
//     password: '31804495598',
//     database: 'experimentdatadb'
// })

// SETTINGS FOR HEROKU DB:

const db = mysql.createConnection({
    user: 'emr0lxlhgjmxblcg',
    host: 'clwxydcjair55xn0.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
    password: 'tyma6eiq0w7i3fna',
    database: 'cg511cow0to6am6v'
})

// Supporting Variables -----------------------------------------

var p_type_determinant = {
    "priming": 0,
    "explainability": 0
}

// Supporting Functions -----------------------------------------

function mainCallback(err) {
    if (err) {
        console.log(err)
    }
}

function incrementPTypeDeterminant(type_identifier) { // Cycles through indices 0 to 2
    var temp = p_type_determinant[type_identifier]

    temp++;

    if (temp > 2) {
        temp = 0
    }

    p_type_determinant[type_identifier] = temp
}

function getCycledElement(type_identifier) { // Returns participant type based on cycled index
    type_index = p_type_determinant[type_identifier]
    incrementPTypeDeterminant(type_identifier)

    return constants.PARTICIPANT_TYPE[Object.keys(constants.PARTICIPANT_TYPE)[type_index]]
}

// Register view engine -----------------------------------------
app.set('view engine', 'ejs')

// Middleware and static files ----------------------------------
app.use(express.static(__dirname + '/static'))
app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`)
});

// Routing ------------------------------------------------------
app.get('/', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('index', page_data);
});

app.get('/register', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('register', page_data);
});

app.get('/generic_info', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        participant_id: req.cookies.participant_id
    }
    
    res.render('generic_info', page_data); // Possible error cause: participant_id = null
});

app.get('/birads_video', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }
    
    res.render('birads_video', page_data)
});

app.get('/experiment_start/:id', async (req, res) => {
    const participant_id = req.params.id;
    
    var category_type = null;
    var participant_type = null;

    async.waterfall([
        (callback) => {
            db.query('SELECT category_type, participant_type FROM participants WHERE email = ?', 
            [participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + participant_id)
                    callback(err)
                }
                callback(null, result)
            });
        }, 
        (result, callback) => {
            fetched_data = result[0]
            category_type = fetched_data.category_type
            participant_type = fetched_data.participant_type
            
            if (category_type === constants.CATEGORY_TYPE.EXPLAINABILITY) {
                res.redirect('/experiment/' + participant_id);
            } else if (category_type === constants.CATEGORY_TYPE.PRIMING) {
                const video_id = constants.VIDEO_SUFFIX[participant_type] // Spoofing a video id to prevent bias
                res.redirect('/video/' + video_id)
            }
            callback(null)
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    });
});

app.get('/video/:id', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        video_id: req.params.id,
        participant_id: req.cookies.participant_id
    }

    // finish rendering correct video (assets in db?)
    res.render('video', page_data); // Possible error cause: participant_id = null
});

app.get('/experiment/:id', (req, res) => {
    const participant_id = req.params.id;
    var classification_obj = null;

    async.waterfall([
        (callback) => {
            db.query('SELECT classification FROM participants WHERE email  = ?', 
            [participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + participant_id)
                    mainCallback(err)
                }
                callback(null, result)
            });
        }, 
        (result, callback) => { // Checking for active current task, or if all tasks are done
            fetched_data = result[0]
            classification_obj = fetched_data.classification
            
            
            if (classification_obj.current != null) {
                res.redirect('/experiment/' + participant_id + '/task/' + classification_obj.current);
                mainCallback(null)
            } else if (classification_obj.remaining.length > 0) {
                classification_obj.current = classification_obj.remaining.pop() // Loading new active current
                callback(null, classification_obj)
            } else {
                res.redirect('/experiment_end');
                mainCallback(null)
            }
        },
        (classification_obj, callback) => { // Updating classification object in db
            if (classification_obj) {
                postable_classification = JSON.stringify(classification_obj)

                db.query(
                    'UPDATE participants SET classification = ? WHERE email  = ?',
                    [postable_classification, participant_id], 
                    (err, result) => {
                    if (err) {
                        console.log("Something went wrong in updating classification after loading new current.")
                        mainCallback(err)
                    }
                    console.log(`Classification object for participant ${participant_id} updated`)
                    callback(null, classification_obj)
                });

            } else {
                console.log("Something went wrong in reading the classification object.")
                callback(null)
            }
        },
        (classification_obj, callback) => {
            res.redirect('/experiment/' + participant_id + '/task/' + classification_obj.current);
            callback(null)
        }
    ], mainCallback);
});

app.get('/experiment/:participant_id/task/:task_id', (req, res) => {
    const participant_id = req.params.participant_id
    const task_id = req.params.task_id

    async.waterfall([
        (callback) => {
            db.query('SELECT classification, participant_type FROM participants WHERE email  = ?', 
            [participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + participant_id)
                    callback(err)
                }
                callback(null, result)
            });
        },
        (result, callback) => {
            fetched_data = result[0];
            classification_obj = fetched_data.classification;
            participant_type = fetched_data.participant_type;

            if (classification_obj.current != task_id) {
                callback(`DB task_id and URI task_id do not match: ${classification_obj.current} vs ${task_id}`)
            } else {
                callback(null, classification_obj, participant_type)
            }
        },
        (classification_obj, participant_type, callback) => {
            db.query('SELECT * FROM tasks WHERE id_task = ?', 
            [task_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve task data for ID: " + task_id)
                    callback(err)
                } else {
                    callback(null, result, classification_obj, participant_type)
                }
            });
        },
        (result, classification_obj, participant_type, callback) => {
            fetched_data = result[0];
            var page_data = {
                JQUERY_URL: constants.JQUERY_CDN_URL,
                participant_id,
                participant_type,
                PARTICIPANT_TYPES: constants.PARTICIPANT_TYPE,
                task: fetched_data,
                classification: classification_obj
            }
            res.render('task', page_data);
            callback(null)
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    })
});

app.get('/experiment_end', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('experiment_end', page_data)
});

// POST REQUESTS ---------------------------------------------------------------------
app.post("/register_participant", (req, res) => {
    const email = req.body.email

    async.waterfall([
        (callback) => { // Verifying availability of email address
            db.query('SELECT * FROM participants WHERE email = ?', 
            [email], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + email)
                    mainCallback(err)
                } else if (result.length != 0) {
                    res.status(500).send({ error: "This email is already in use. Please register with a different email or log in with your current email."})
                    mainCallback(`Email ${email} is already in use. Aborting registration.`)
                } else {
                    callback()
                }
            });
        },
        (callback) => {
            console.log("Participant registration received")

            control_profession = req.body.control_profession;
            control_exp_radiology = req.body.control_exp_radiology;
            control_exp_mammography = req.body.control_exp_mammography;
            control_last_time_eval = req.body.control_last_time_eval;

            classification = JSON.stringify(utils.initializeClassificationObject());
            
            // Truly random assignment of category types
            category_type = constants.CATEGORY_TYPE[utils.getRandomElement(Object.keys(constants.CATEGORY_TYPE))];

            // Cyclic assignment of participant types (to force equal distribution)
            participant_type = getCycledElement(category_type);

            // Define no_contact
            if (req.body.no_contact) {
                no_contact = true;
            } else {
                no_contact = false;
            }

            const query = `INSERT INTO participants (
                email,
                control_profession, 
                control_exp_radiology, 
                control_exp_mammography, 
                control_last_time_eval,
                classification,
                participant_type,
                category_type,
                no_contact
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            console.log("Posting participant registration...")
            db.query(query, [
                email,
                control_profession, 
                control_exp_radiology, 
                control_exp_mammography, 
                control_last_time_eval,
                classification,
                participant_type,
                category_type,
                no_contact
            ], 
            (err, result) => {
                if (err) {
                    console.log("Posting participant registration failed:")
                    console.log(err)
                }
        
                // Saving participant ID in cookies
                entry_id = result.insertId
                participant_id = email
                console.log("Registered participant: " + entry_id)
                console.log("Participant ID: " + participant_id)
                res.cookie('participant_id', participant_id)
        
                res.send(result)
                callback(null);
            });
        }
    ], mainCallback);
});

app.post("/save_task", (req, res) => {

    async.waterfall([
        (callback) => { // Posting Classification measurements to DB
            
            // total_time_heatmap = req.body.total_time_heatmap 
            // total_visits_heatmap = req.body.total_visits_heatmap
            // total_time_prob_distr = req.body.total_time_prob_distr
            // total_visits_prob_distr = req.body.total_visits_prob_distr
            // total_time_contr_attr = req.body.total_time_contr_attr
            // total_visits_contr_attr = req.body.total_visits_contr_attr 
            
            const query = `INSERT INTO classification (
                participant_id,
                task_id,
                birads_classification,
                total_time_ai_prediction,
                total_time_class_submit,
                total_time_birads_expl,
                total_visits_birads_expl,
                total_time_first_birads_class,
                total_birads_class_changes,
                total_time_heatmap,
                total_visits_heatmap,
                total_time_prob_distr,
                total_visits_prob_distr,
                total_time_contr_attr,
                total_visits_contr_attr
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            console.log("Posting classification measurements...")
            db.query(query, [
                req.body.participant_id,
                req.body.task_id,
                req.body.birads_classification,
                req.body.total_time_ai_prediction,
                req.body.total_time_class_submit,
                req.body.total_time_birads_expl,
                req.body.total_visits_birads_expl,
                req.body.total_time_first_birads_class,
                req.body.total_birads_class_changes,
                req.body.total_time_heatmap, 
                req.body.total_visits_heatmap,
                req.body.total_time_prob_distr,
                req.body.total_visits_prob_distr,
                req.body.total_time_contr_attr,
                req.body.total_visits_contr_attr
            ], 
            (err, result) => {
                if (err) {
                    console.log("Posting participant registration failed:")
                    callback(err)
                } else {
                    result_obj ={
                        measurement_result: result
                    }
                    callback(null, result_obj);
                }
            });
        },
        (result_obj, callback) => {
            classification_obj = req.body.classification_obj
            classification_obj.finished.push(classification_obj.current)
            classification_obj.current = null

            postable_classification = JSON.stringify(req.body.classification_obj)

            db.query(
                'UPDATE participants SET classification = ? WHERE email  = ?',
                [postable_classification, req.body.participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Something went wrong in updating classification after loading new current.")
                    callback(err)
                } else {
                    console.log(`Classification object for participant ${req.body.participant_id} updated`)
                    result_obj.classification_result = result
                    callback(null, result_obj)
                }
            });
        }
    ], (err, result_obj) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result_obj)
        }
    });
});


// UPDATING CLASSIFICATION -----------------------------------------------------------

// app.put("/update_class1", (req, res) => {
//     const participant_id = req.body.id
//     const classification = JSON.stringify(req.body.classification)

//     console.log("updating classification 1")

//     db.query(
//         'UPDATE participants SET classification = ? WHERE id = ?',
//         [classification, participant_id], 
//         (err, result) => {
//         if (err) {
//             console.log(err)
//         }
    
//         res.send(result)
//     });

// });

// app.put("/update_tasks", (req, res) => {
//     const task_id = req.body.id
//     const true_classification = JSON.stringify(req.body.true_classification)
//     const ai_classification = JSON.stringify(req.body.ai_classification)
    
//     db.query(
//         'UPDATE tasks SET true_classification = ?, ai_classification = ?  WHERE id_task = ?',
//         [true_classification, ai_classification, task_id], 
//         (err, result) => {
//         if (err) {
//             console.log(err)
//         }
        
//         res.send(result)
//     });

// });


// Database Initial Population Links -------------------------------------------------

app.post("/build_database", (req, res) => {
    const participant_name = req.body.name

    console.log("insert req received")
    console.log("request:")
    console.log(req.body)
    
    db.query(
        'INSERT INTO participants (first_name) VALUES (?)',
        [participant_name], 
        (err, result) => {
        if (err) {
            console.log(err)
        }
    
        res.send(result)
    });

});
