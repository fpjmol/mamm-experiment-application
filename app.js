const PORT = process.env.PORT || 3000

const express = require('express')
const cookieParser = require('cookie-parser')
const async = require('async')
const constants = require('./constants')
const utils = require('./utils')
const favicon = require('serve-favicon')
var cors = require('cors')
var device = require('express-device')
var SimpleCrypto = require("simple-crypto-js").default

const app = express();

app.use(favicon(__dirname + '/static/img/favicon.ico'))
app.use(device.capture())
app.use(cookieParser())
app.use(cors())

const mysql = require('mysql2');

// SETTINGS FOR IRAN DB:

const db = mysql.createConnection({
    user: 'experiment',
    host: 'localhost',
    password: 'CrChb_VWA20gh09dlTGeO',
    database: 'db_experiment'
})


// Supporting Variables -----------------------------------------

var p_type_determinant = {
    "priming": 0,
    "explainability": 0
}

var category_bool_is_priming = true;
var video_bool_is_pos = true;


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

function flipCategoryBool() {
    category_bool_is_priming = !category_bool_is_priming
}

function flipVideoBool() {
    video_bool_is_pos = !video_bool_is_pos;
}

// Functions for Server Variables ------------------------------

function initializeServerVariables() {
    const server_var_id = 1;

    db.query('SELECT * FROM server WHERE id_server = ?', 
    [server_var_id], 
        (err, result) => {
            if (err) {
                console.log("Retrieving Server Variables failed:")
                console.log(err)
            } else {
                p_type_determinant = result[0].p_type_determinant;
                category_bool_is_priming = result[0].category_bool_is_priming;
                video_bool_is_pos = result[0].video_bool_is_pos;

                console.log("Retrieving Server Variables succesfull:")
                console.log(`p_type_determinant: ${JSON.stringify(p_type_determinant)}`)
                console.log(`category_bool_is_priming: ${category_bool_is_priming}`)
                console.log(`video_bool_is_pos: ${video_bool_is_pos}`)
            }
    });
}

function saveServerVariables(callback) {
    const server_var_id = 1;

    db.query('UPDATE server SET p_type_determinant = ?, category_bool_is_priming = ?, video_bool_is_pos = ? WHERE id_server = ?', 
    [
        JSON.stringify(p_type_determinant),
        category_bool_is_priming,
        video_bool_is_pos,
        server_var_id
    ], 
        (err, result) => {
            if (err) {
                console.log("Updating Server Variables failed:")
                console.log(err)
                callback(err)
            } else {
                callback(null)
            }
    });
}


// Populating Server Variables ----------------------------------

initializeServerVariables()


// Register view engine -----------------------------------------

app.set('view engine', 'ejs')

// Middleware and static files ----------------------------------

app.use(express.static(__dirname + '/static'))
app.use(express.json())


// Routing ------------------------------------------------------

app.all('/*', (req, res, next) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    if (req.device.type === "desktop") {
        next()
    } else {
        res.render('mobile', page_data);
    }
});

app.get('/', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('index', page_data);
});

app.get('/consent_form', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('consent_form', page_data);
})

app.get('/register', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('register', page_data);
});

app.get('/registration-successful/:id', (req, res) => {
    const participant_id = req.params.id;

    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        participant_id
    }

    res.render('generic_info', page_data);
});

app.get('/routing/:id', (req, res) => {
    const participant_id = req.params.id;

    async.waterfall([
        (callback) => {
            db.query('SELECT category_type FROM participants WHERE email  = ?', 
            [participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + participant_id)
                    mainCallback(err)
                }
                callback(null, result)
            });
        },
        (result, callback) => {
            var fetched_data = result[0];
            const category_type = fetched_data.category_type;

            if (category_type === constants.CATEGORY_TYPE.PRIMING) {
                res.redirect('/ai-video/' + participant_id);
            } else {
                res.redirect('/interface-training/' + participant_id)
            }
            callback(null)
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    });
});

app.get('/ai-video/:id', (req, res) => {
    const participant_id= req.params.id;
    
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        participant_id,
        EXPERIMENT_STAGE: constants.EXPERIMENT_STAGE
    }

    res.render('general_video', page_data);
});

app.get('/interface-training/:id', (req, res) => {
    const participant_id = req.params.id;

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
        (data_result, callback) => {
            db.query('SELECT * FROM tasks WHERE id_task = ?', 
            [constants.TRAINING_TASK], 
                (err, task_result) => {
                if (err) {
                    console.log("Failed to retrieve task data for ID: " + constants.TRAINING_TASK)
                    callback(err)
                } else {
                    callback(null, task_result, data_result)
                }
            });
        },
        (task_result, data_result, callback) => {
            fetched_data = data_result[0];
            task_data = task_result[0];
            category_type = fetched_data.category_type;
            participant_type = fetched_data.participant_type;

            if(task_data.genetic_predis === 1) { // Transforming boolean value into string
                task_data.genetic_predis = "Yes"
            } else {
                task_data.genetic_predis = "No"
            }

            var page_data = {
                JQUERY_URL: constants.JQUERY_CDN_URL,
                participant_id,
                category_type,
                participant_type,
                PARTICIPANT_TYPES: constants.PARTICIPANT_TYPE,
                CATEGORY_TYPES: constants.CATEGORY_TYPE,
                task: task_data
            }

            res.render('training', page_data)
            callback(null);
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    });
   
    
   
});

app.get('/pre-experiment/:id', async (req, res) => {
    const participant_id = req.params.id;
    
    var category_type = null;
    var participant_type = null;

    async.waterfall([
        (callback) => {
            db.query('SELECT category_type, participant_type, video_bool_is_pos FROM participants WHERE email = ?', 
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
            var video_bool_is_pos = fetched_data.video_bool_is_pos;
            
            if (category_type === constants.CATEGORY_TYPE.EXPLAINABILITY || participant_type === constants.PARTICIPANT_TYPE.TYPE_C) {
                res.redirect('/experiment-start/' + participant_id);
            } else if (category_type === constants.CATEGORY_TYPE.PRIMING) {

                const video_id = constants.VIDEO_SUFFIX[participant_type] // Spoofing a video id to prevent bias
                
                var participant_data = {
                    participant_type,
                    video_bool_is_pos
                }

                const simpleCrypto = new SimpleCrypto(video_id);
                const participant_data_encrypted = simpleCrypto.encrypt(participant_data);
                const uri_data = encodeURIComponent(participant_data_encrypted);
                res.redirect(`/video/${participant_id}/${video_id}/${uri_data}`)
            }
            callback(null)
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    });
});

app.get('/experiment-start/:id', (req, res) => {
    const participant_id = req.params.id;

    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        participant_id
    }

    res.render('experiment_start', page_data);
});

app.get('/video/:participant_id/:video_id/:uri_data', cors(), (req, res) => {
    const video_id = req.params.video_id
    const uri_data = req.params.uri_data

    // Decrypt uri endoded participant data
    const simpleCrypto = new SimpleCrypto(video_id)
    var participant_data = simpleCrypto.decrypt(decodeURIComponent(uri_data));

    // Determine video link
    switch(participant_data.participant_type) {
        case constants.PARTICIPANT_TYPE.TYPE_A:
            var video_link = constants.VIDEO_LINKS.aef2dhv34A;
            break;
        case constants.PARTICIPANT_TYPE.TYPE_B:
            if (participant_data.video_bool_is_pos) {
                var video_link = constants.VIDEO_LINKS.b3TR298yuBp;
            } else {
                var video_link = constants.VIDEO_LINKS.b3TR298yuBn;
            }
            break;
    }

    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL,
        participant_id: req.params.participant_id,
        video_link
    }

    res.cookie('cross-origin','whatever', {Domain: 'https://www.aparat.com'});
    res.render('video', page_data);

});

app.get('/experiment/:id', (req, res) => {
    const participant_id = req.params.id;
    var classification_obj = null;
    console.log("") // For new line

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
                res.redirect('/post-experiment/' + participant_id);
                mainCallback(null)
            }
        },
        (classification_obj, callback) => { // Updating classification object & exp_stage in db
            if (classification_obj) {
                postable_classification = JSON.stringify(classification_obj)
                var exp_stage = constants.EXPERIMENT_STAGE.EXP_TASKS

                db.query(
                    'UPDATE participants SET classification = ?, exp_stage = ? WHERE email  = ?',
                    [postable_classification, exp_stage, participant_id], 
                    (err, result) => {
                    if (err) {
                        console.log("Something went wrong in updating classification & exp_stage after loading new current.")
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
            db.query('SELECT classification, participant_type, category_type FROM participants WHERE email  = ?', 
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
            category_type = fetched_data.category_type;

            if (classification_obj.current != task_id) {
                callback(`DB task_id and URI task_id do not match: ${classification_obj.current} vs ${task_id}`)
            } else {
                callback(null, classification_obj, participant_type, category_type)
            }
        },
        (classification_obj, participant_type, category_type, callback) => {
            db.query('SELECT * FROM tasks WHERE id_task = ?', 
            [task_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve task data for ID: " + task_id)
                    callback(err)
                } else {
                    callback(null, result, classification_obj, participant_type, category_type)
                }
            });
        },
        (result, classification_obj, participant_type, category_type, callback) => {
            fetched_data = result[0];

            if(fetched_data.genetic_predis === 1) { // Transforming boolean value into string
                fetched_data.genetic_predis = "Yes"
            } else {
                fetched_data.genetic_predis = "No"
            }

            var page_data = {
                JQUERY_URL: constants.JQUERY_CDN_URL,
                participant_id,
                participant_type,
                category_type,
                PARTICIPANT_TYPES: constants.PARTICIPANT_TYPE,
                CATEGORY_TYPES: constants.CATEGORY_TYPE,
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

app.get('/post-experiment/:id', (req, res) => {
    const participant_id = req.params.id;

    async.waterfall([
        (callback) => {
            db.query('SELECT participant_type, category_type FROM participants WHERE email  = ?', 
            [participant_id], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + participant_id)
                    callback(err)
                }
                callback(null, result)
            });
        }, (result, callback) => {
            var fetched_data = result[0];

            var page_data = {
                participant_id,
                participant_type: fetched_data.participant_type,
                category_type: fetched_data.category_type,
                PARTICIPANT_TYPES: constants.PARTICIPANT_TYPE,
                CATEGORY_TYPES: constants.CATEGORY_TYPE,
                JQUERY_URL: constants.JQUERY_CDN_URL
            }

            res.render('post_experiment', page_data)
            callback(null)
        }
    ], (err) => {
        if (err) {
            console.log(err)
        }
    });

});

app.get('/experiment-end', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('experiment_end', page_data)
});

app.get('/login', (req, res) => {
    var page_data = {
        JQUERY_URL: constants.JQUERY_CDN_URL
    }
    
    res.render('login', page_data)
});

app.get('/join/:id/:stage/:type', (req, res) => { // Handles rejoining experiment
    const participant_id = req.params.id;
    const exp_stage = req.params.stage;
    const participant_type = req.params.type;

    var join_URL = null;

    switch(exp_stage) {
        case constants.EXPERIMENT_STAGE.GEN_INFO:
            join_URL = '/registration-successful/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.GEN_VIDEO:
            join_URL = '/ai-video/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.TRAINING:
            join_URL = '/interface-training/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.PRIME_VIDEO:
            join_URL = '/pre-experiment/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.EXP_START:
            join_URL = '/experiment-start/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.EXP_TASKS:
            join_URL = '/experiment/' + participant_id;
            break;
        case constants.EXPERIMENT_STAGE.EXP_END:
            join_URL = '/experiment-end'
    }

    if (join_URL) {
        console.log(`Joining user: ${participant_id} on stage: ${exp_stage}`)
        res.redirect(join_URL);
    } else {
        console.error(`Something went wrong in loading the experiment stage during login.`)
    }
});


// POST/PUT REQUESTS ---------------------------------------------------------------------

app.post("/register_participant", (req, res) => {
    const email = req.body.email
    console.log("") // For new line

    async.waterfall([
        (callback) => { // Verifying availability of email address
            db.query('SELECT * FROM participants WHERE email = ?', 
            [email], 
                (err, result) => {
                if (err) {
                    console.log("Failed to retrieve data for ID: " + email)
                    mainCallback(err)
                } else if (result.length != 0) {
                    res.status(500).send({ error: "This email is already in use. Please register with a different email."})
                    mainCallback(`Email ${email} is already in use. Aborting registration.`)
                } else {
                    callback()
                }
            });
        },
        (callback) => {
            console.log("Participant registration received")

            control_hospital = req.body.control_hospital;
            control_last_mamm = req.body.control_last_mamm;
            control_nr_mamms_weekly = req.body.control_nr_mamms_weekly;
            control_cad_exp = req.body.control_cad_exp;
            control_ai_exp = req.body.control_cad_exp;
            experiment_start_time = req.body.experiment_start_time;

            control_exp_last = req.body.control_exp_last || null;
            var participant_video_bool = null;

            classification = JSON.stringify(utils.initializeClassificationObject());
            
            // Truly random assignment of category types --> DEPRICATED TO FORCE EQUAL DISTRIBUTION!!!
            // category_type = constants.CATEGORY_TYPE[utils.getRandomElement(Object.keys(constants.CATEGORY_TYPE))]; 

            // Cyclic assignment of category types
            if (category_bool_is_priming) {
                category_type = constants.CATEGORY_TYPE.PRIMING
            } else {
                category_type = constants.CATEGORY_TYPE.EXPLAINABILITY
            }
            flipCategoryBool(); // flips category for next participant

            // Cyclic assignment of participant types (to force equal distribution)
            participant_type = getCycledElement(category_type);

            // Assignment of video bool based on participant type
            if (category_type === constants.CATEGORY_TYPE.PRIMING && participant_type === constants.PARTICIPANT_TYPE.TYPE_B) {
                participant_video_bool = video_bool_is_pos;
                flipVideoBool();
            }

            // Assignment of initial Experiment Stage
            exp_stage = constants.EXPERIMENT_STAGE.GEN_INFO;

            const query = `INSERT INTO participants (
                email,
                control_hospital, 
                control_last_mamm, 
                control_nr_mamms_weekly, 
                control_cad_exp,
                control_ai_exp,
                control_exp_last,
                classification,
                participant_type,
                category_type,
                video_bool_is_pos,
                experiment_start_time,
                exp_stage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            console.log("Posting participant registration...")
            db.query(query, [
                email,
                control_hospital, 
                control_last_mamm, 
                control_nr_mamms_weekly, 
                control_cad_exp,
                control_ai_exp,
                control_exp_last,
                classification,
                participant_type,
                category_type,
                participant_video_bool,
                experiment_start_time,
                exp_stage
            ], 
            (err, result) => {
                if (err) {
                    console.log("Posting participant registration failed:")
                    console.log(err)
                }
        
                // Saving participant ID
                entry_id = result.insertId
                participant_id = email
                console.log("Registered participant: " + entry_id)
                console.log("Participant ID: " + participant_id)
        
                result.participant_id = participant_id
                res.send(result)
                callback(null);
            });
        },
        (callback) => {
            saveServerVariables(callback);
        }
    ], mainCallback);
});

app.post("/save_task", (req, res) => {
    console.log("") // For new line
    
    async.waterfall([
        (callback) => { // Posting Classification measurements to DB
            
            var participant_birads_classification = JSON.stringify(req.body.birads_classification);

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
                total_visits_contr_attr,
                total_time_open_heatmap
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            console.log("Posting classification measurements...")
            db.query(query, [
                req.body.participant_id,
                req.body.task_id,
                participant_birads_classification,
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
                req.body.total_visits_contr_attr,
                req.body.total_time_open_heatmap
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

app.post('/login', (req, res) => {
    const email = req.body.participant_id
    console.log("") // For new line

    db.query('SELECT email, exp_stage, participant_type FROM participants WHERE email = ?', 
    [email], 
        (err, result) => {
        if (err) {
            console.log("Failed to retrieve data for ID: " + email)
        } else if (result.length === 0) {
            res.status(500).send({ error: "This email does not seem to be registered. Please register a valid email to continue."})
            console.log(`Login attempt with ID: ${email}. This ID was not found in existing entries.`)
        } else {
            console.log(`Login successful for ID: ${email}`)
            res.send(result)
        }
    });

});

app.put("/update_stage/:stage", (req, res) => {
    const participant_id = req.body.id
    const exp_stage = req.params.stage

    console.log("") // For new line
    console.log(`Updating stage for ${participant_id}...`)

    db.query(
        'UPDATE participants SET exp_stage = ? WHERE email = ?',
        [exp_stage, participant_id], 
        (err, result) => {
        if (err) {
            res.status(500).send({ error: "Updating experiment stage on page load failed."})
        } else {
            console.log(`Updated stage for ${participant_id} to ${exp_stage}`)
            res.send(result)
        }
    });

});

app.put("/save_tasks_start", (req, res) => {
    const participant_id = req.body.participant_id;
    const tasks_start_time = req.body.tasks_start_time;

    console.log("") // For new line
    console.log(`[${tasks_start_time}]: Participant ${participant_id} is starting tasks...`)

    db.query(
        'UPDATE participants SET tasks_start_time = ? WHERE email = ?',
        [tasks_start_time, participant_id], 
        (err, result) => {
        if (err) {
            res.status(500).send({ error: `Saving tasks start time for participant ${participant_id} failed.`})
        } else {
            res.send(result)
        }
    });
});

app.put("/save_tasks_end", (req, res) => {
    const participant_id = req.body.participant_id;
    const tasks_end_time = req.body.tasks_end_time;

    console.log("") // For new line
    console.log(`[${tasks_end_time}]: Participant ${participant_id} finished tasks.`)

    db.query(
        'UPDATE participants SET tasks_end_time = ? WHERE email = ?',
        [tasks_end_time, participant_id], 
        (err, result) => {
        if (err) {
            res.status(500).send({ error: `Saving tasks end time for participant ${participant_id} failed.`})
        } else {
            res.send(result)
        }
    });
});

app.put("/save_training", (req, res) => {
    const participant_id = req.body.participant_id
    const total_training_time = req.body.total_training_time

    console.log("") // For new line
    console.log(`Updating data for ${participant_id}...`)

    db.query(
        'UPDATE participants SET total_training_time = ? WHERE email = ?',
        [total_training_time, participant_id], 
        (err, result) => {
        if (err) {
            res.status(500).send({ error: `Updating data for ${participant_id} failed.`})
        } else {
            res.send(result)
        }
    });

});

app.put('/final_participant_data', (req, res) => {
    const participant_id = req.body.participant_id;
    
    async.waterfall([
        (callback) => {

            if(req.body.receive_update) {
                var receive_update = true;
            } else {
                var receive_update = false;
            }

            var post_heatmap_usefulness = req.body.post_heatmap_usefulness || null;
            var post_prob_distr_usefulness = req.body.post_prob_distr_usefulness || null;
            var post_contr_attr_usefulness = req.body.post_contr_attr_usefulness || null;
                       
            const query = `UPDATE participants 
            SET post_ai_trust = ?,
            post_ai_usefulness = ?,
            post_heatmap_usefulness = ?,
            post_prob_distr_usefulness = ?,
            post_contr_attr_usefulness = ?,
            receive_update = ?,
            experiment_end_time = ?
            WHERE email = ?`;
            
            console.log("Posting classification measurements...")
            db.query(query, [
                req.body.post_ai_trust,
                req.body.post_ai_usefulness,
                post_heatmap_usefulness,
                post_prob_distr_usefulness,
                post_contr_attr_usefulness,
                receive_update,
                req.body.experiment_end_time,
                participant_id
            ], 
            (err, result) => {
                if (err) {
                    console.log("Posting participant data failed:")
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
            const exp_stage = constants.EXPERIMENT_STAGE.EXP_END;
            console.log("") // For new line
            console.log(`Updating stage for ${participant_id}...`)
        
            db.query(
                'UPDATE participants SET exp_stage = ? WHERE email = ?',
                [exp_stage, participant_id], 
                (err, result) => {
                if (err) {
                    res.status(500).send({ error: "Updating experiment stage after form submission failed."})
                } else {
                    console.log(`Updated stage for ${participant_id} to ${exp_stage}`)
                    result_obj.stage_result = result;
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

// STARTING SERVER ---------------------------------------------------------------------

app.get('*', function(req, res){
    var page_data = {
        attempted_URL: req.get('host') + req.originalUrl,
        JQUERY_URL: constants.JQUERY_CDN_URL
    }

    res.render('404', page_data)
});


// STARTING SERVER ---------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`)
});