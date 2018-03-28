
var models = require('./../models/schema');
var User = require('./../models/user');
//var isLoggedInForRest = require('./util/isLoggedInForRest');

module.exports = function (app, passport, logger) {

// const requireAdminAuth = require('./config/adminAuth')(passport, logger);

    const requireAuth = passport.authenticate('jwt', { session: false });
    // -----------
    const JwtStrategy = require('passport-jwt').Strategy;
    const ExtractJwt = require('passport-jwt').ExtractJwt;
    const config = require('./config/secret');
    // Setup options for JWT Strategy
    const jwtOptions = {
        // jwtFromRequest: ExtractJwt.fromHeader('Authorization'),
        jwtFromRequest: ExtractJwt.fromHeader('auth'),
        secretOrKey: config.secret
    };

    // Create JWT strategy
    const jwtFetchUser = new JwtStrategy(jwtOptions, function (payload, done) {
        // See if the user ID in the payload exists in our database
        // If it does, call 'done' with that other
        // otherwise, call done without a user object
        logger.debug('Token on sever ****' + payload.sub);
        // logger.debug(jwtOptions.jwtFromRequest)
        User.findById(payload.sub, function (err, user) {
            if (err) { return done(err, false); }
            if (user) { done(null, user); }
            else { done(null, false); }
        });
    });

    passport.use('jwt', jwtFetchUser);


// http://localhost:4000/mapUserTraining/trainingUniqueName
    app.get("/makeUserTraining/:training", requireAuth, function (req, res, next) {
        let userEmail = req.user.local.email;
        let trainingUniqueName = req.params.training;

        models.Training.findOne({ uniqueName: trainingUniqueName }, function (err, training) {
            if (err) res.json({ success: false, message: "error in finding Training ", trainingUniqueName });

            if (!training) {
                res.json({ success: false, message: "Invalid training name" });
            }
            else {
                console.log(userEmail);
                // console.log(training);
                models.UserTraining.findOne({ user: userEmail, trainingId: training._id }, function (err, userTraining) {
                    if (err) res.json({ success: false, message: "error in checking if user already has request" });
                    
                    if(userTraining){
                        res.json({ success: false, message: "User is already part of this training"});
                    } else {
                        var userTraining = new models.UserTraining({
                            user: userEmail,
                            trainingId: training._id
                        })

                        userTraining.save(function (err) {
                            if (err) {
                                res.json({ success: false, message: "Error in saving the document, please try again..."});
                                throw err;
                            };
                            logger.info('UserTraining saved');
                            res.json({ success: true, message: "UserTraining saved in database"});
                        })

                    }

                })

/*                models.TrainingChecker.find({ user: userEmail, trainingId: training._id }, function (err, trainings) {
                    if (err) res.json({ success: false, message: "error in checking if user already has request" });

                    if (trainings.length > 0) {
                        res.json({ success: false, message: "You already have a pending request for this training" });
                    } else {
                        let trainingChecker = new models.TrainingChecker({
                            user: userEmail,
                            trainingId: training._id
                        })

                        trainingChecker.save(function (err) {
                            if (err) throw err;
                            logger.debug('trainingChecker saved for user: ', userEmail);
                            res.json({ success: true, trainingChecker: trainingChecker });
                        });
                    }
                });
*/            }
        })
    })


    app.post("/findPendingTrainingMakers", requireAuth, function(req, res){
        let role = req.user.local.role;
        logger.info(role);

        if( "admin" === role){
            models.UserTraining.find({status: "pending"}, function (err, userTrainings) {
                if (err) res.json({ success: false, message: "error in finding trainingMakers" });

                res.json({success: true, userTrainings: userTrainings})
            });
        } else {
                res.status(403).json({success: false, message: "You are not admin"});
        }
    })
    app.post("/processPendingTrainingMakers/:status", requireAuth, function(req, res){
        let role = req.user.local.role;
        let checker = req.params.status === "a"?"accepted":req.params.status === "d"?"deleted":"pending";

        if( "admin" === role){
            let makers = req.body.makers; // array of [{user, trainingId}]
                // let acceptedRequests = [];
            makers.forEach((maker, i)=>{
                models.UserTraining.findOne({user:maker.user, trainingId:maker.trainingId, status: "pending"}, function (err, userTraining) {
                    if (err) {res.json({ success: false, message: "error in finding pending requests" })}
                    else if(!userTraining){
                        // dont do anything if maker is null or undefined
                        // acceptedRequests.push({user:maker.user, trainingId:maker.trainingId})
                        // logger.debug(acceptedRequests);
                    }
                else {
                    logger.debug(userTraining);
                    userTraining.status = checker;
                    userTraining.save(function(err){
                        if(err){
                            res.json({success: false, message: "Error in accepting the request, please try again..."});
                            throw err;
                        }
                    });
                }
            });

                if(i == makers.length-1){
                    // res.json({success: true, message: "All requests are accepted", acceptedRequests: acceptedRequests});
                    res.json({success: true, message: "All requests are processed to "+checker});
                }
            });
        } else {
                res.status(403).json({success: false, message: "You are not admin"});
        }
    })


    // -----------
    app.post('/findUserTrainingQuiz', requireAuth, function (req, res) {
        // let userEmail = req.body.email;
        let userEmail = req.user.local.email;
        models.UserTraining.find({ user: userEmail }, function (err, userTrainings) {
            if (err) res.json({ success: false, message: "error in finding UserTraining" });
// logger.debug(userTrainings);
            let trainingQuizzesResult = [];
            for (let i = 0; i < userTrainings.length; i++) {
                models.TrainingQuiz.find({ trainingId: userTrainings[i].trainingId }, function (err, trainingQuizzes) {
                    if (err) res.json({ success: false, message: "error in finding TrainingQuiz" });

// logger.debug(trainingQuizzes);

                    trainingQuizzes.forEach(trainingQuiz => { 
                        // trainingQuiz.status = userTrainings[i].status;
                        trainingQuizzesResult.push({trainingQuiz: trainingQuiz, status: userTrainings[i].status}) 
                    });
                    // logger.debug(trainingQuizzesResult);

                    //send response in last iteration
                    if (i == userTrainings.length - 1) {
                        // logger.debug("value of i: "+i);
                        // logger.debug(trainingQuizzesResult);
                        res.json(trainingQuizzesResult);
                    }
                })
            }
        })
    })


    //app.get('/findUserQuiz',isLoggedInForRest, function (req, res) {
    // app.post('/findUserQuiz', function (req, res) {
    /*    app.post('/findUserQuiz', requireAuth, function (req, res) {
            logger.debug(req.body);
            logger.debug(req.get("auth"))
            let userEmail = req.body.email;
            // models.TrainingQuiz.find({user: userEmail}, function (err, quizzes) {
            models.UserQuiz.find({ user: userEmail }, function (err, quizzes) {
                logger.debug('finding UserQuiz');
                if (err) throw err;
                logger.debug(quizzes);
                res.json(quizzes);
            });
        })
    */

    app.get('/findQuizQuestions/:quizid', requireAuth, function (req, res) {
        // app.get('/findQuizQuestions/:quizid', function (req, res) {

        //app.get('/findQuizQuestions',isLoggedInForRest, function (req, res) {
        //routes.post('/findQuizQuestions', function (req, res) {

        logger.debug(req.params.quizid);

        models.QuizQuestion.find({
            quiz: req.params.quizid
        })
            .populate('question')
            .exec(function (err, data) {
                if (err) throw err;

                logger.debug('Printing Data ------------');
                logger.debug(data);

                models.Quiz.findById(req.params.quizid, function (err, quiz) {
                    logger.debug(quiz);
                    logger.debug(quiz.showScores);
                    data[0].showScores = quiz.showScores;

                    // Hide Answers
                    data[0].questions.forEach(function (x) {
                        logger.debug(x)
                        x.answers.forEach(function (y) {
                            y.correct = false
                        })
                    })
                    logger.info('Printing Data After Answers removal------------')
                    logger.debug(data);
                    res.json({ result: data[0], showScores: quiz.showScores });
                    //logger.debug(JSON.stringify(data, null, "\t"))

                });

            })

    })


    app.post('/submitQuiz', requireAuth, function (req, res) {
        //    app.post('/submitQuiz', isLoggedInForRest, function (req, res) {
        logger.debug(req.body);
        logger.debug('=====+++++++++========');
        logger.debug(req.body.selectedQuiz.quiz);
        models.QuizQuestion.find({
            quiz: req.body.selectedQuiz.quiz
        })
            .populate('question')
            .exec(function (err, data) {
                if (err) throw err;

                logger.debug('Printing Data ------------')
                logger.debug(data)


                // Logic to Calculate Scores
                // req.body.selectedQuiz.questions is client questions object
                // data[0].question is db questions object

                logger.info('Calculating Scores------------');
                logger.debug("Client questions+++++++++++++");
                var clientQuestions = req.body.selectedQuiz.questions;
                var dbQuestions = data[0].questions;

                /*
                                logger.debug('client questions------------------------------------------------------');
                                logger.debug(clientQuestions);
                                logger.debug('db questions------------------------------------------------------');
                                logger.debug(dbQuestions);
                */

                var score = 0;
                logger.debug("initial score " + score);
                for (var i = 0; i < dbQuestions.length; i++) {
                    var currentDbQuestion = dbQuestions[i];
                    var currentClientQuestion = clientQuestions[i];

                    var flag = true;
                    for (var j = 0; j < currentDbQuestion.answers.length; j++) {
                        var dbAnswers = currentDbQuestion.answers[j];
                        var clientAnswers = currentClientQuestion.answers[j];

                        if (dbAnswers.correct !== clientAnswers.correct) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        score++;
                    }
                }
                logger.debug("Final score " + score);

                // start save user test score in db
                var percentScore = (score * 100) / data[0].questions.length;
                var score = new models.UserScore({
                    // username: req.body.email,
                    username: req.user.local.email,
                    quiz: data[0].quiz,
                    quizName: data[0].quizName,
                    score: score,
                    percent: percentScore
                });
                score.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    logger.debug("Score saved in db for " + req.body.email);
                });

                res.json({
                    success: true
                });
                //logger.debug(JSON.stringify(data, null, "\t"))
            })
    })
}