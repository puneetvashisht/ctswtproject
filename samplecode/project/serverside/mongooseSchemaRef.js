
// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserQuizSchema = Schema({
    user: String,
    quiz: Number,
    quizName: String,
    description: String,
    date: { type: Date, default: Date.now }
})

var QuizSchema = Schema({
    _id: Number,
    name: String,
    showScores: Boolean,
    description: String,
    date: { type: Date, default: Date.now }
})

var QuizQuestionSchema = Schema({
    quiz: Number,
    quizName: String,
    questions: [{ type: Schema.Types.Object, ref: 'Question' }],
    tl: Number,
    date: { type: Date, default: Date.now }
})

var AnswerSchema = Schema({
    text: String,
    correct:Boolean,
    date: { type: Date, default: Date.now }
})

var QuestionSchema = Schema({
    _id: Number,
    text: String,
    answers: [AnswerSchema],
    date: { type: Date, default: Date.now }
})

var FeedbackSchema = Schema({
    email: String,
    feedback: String,
    rate: Number,
    date: { type: Date, default: Date.now }
})

var UserScoreSchema = Schema({
    username: { type: String, required: true },
    quiz: Number,
    quizName: String,
    date: { type: Date, default: Date.now },
    score: Number,
    percent: { type: Number, default: 0 },
    // testRunning: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
})

var VideoSectionSchema = Schema({
    name: String,
//    video : { type : Array , "default" : [] }
    videos : [{ title : String, url : String }],
    date: { type: Date, default: Date.now }
})

var VideoSchema = Schema({
    title: String,
    sections: [VideoSectionSchema],
    date: { type: Date, default: Date.now }
});

// Subdocument schema for votes
var voteSchema = new mongoose.Schema({ ip: 'String',
    date: { type: Date, default: Date.now } });

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({
    text: String,
    votes: [voteSchema],
    date: { type: Date, default: Date.now }
});

var TrainingSchema = Schema({
    _id: Number,
    uniqueName: String,
    name: String,
    description: String,
    date: { type: Date, default: Date.now }
})

var UserTrainingSchema = Schema({
    user: String,
    // quiz: Number,
    // quizName: String,
    // training: {type: Schema.Types.Object, ref: 'Training'},
    trainingId: Number,
    status: { type: String, default: "pending"},
    date: { type: Date, default: Date.now }
})

var TrainingQuizSchema = Schema({
    // _id: Number,
    // user: String,
    quiz: Number,
    quizName: String,
    description: String,
    trainingId: Number,
    date: { type: Date, default: Date.now }
})

var TrainingCheckerSchema = Schema({
    user: String,
    trainingId: Number,
    allowed: { type: Boolean, default: false},
    date: { type: Date, default: Date.now }
})


// Document schema for polls
var PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    choices: [choiceSchema],
    date: { type: Date, default: Date.now }
});


var ContactSchema = Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
})



// by- arun=> for auto increment
// auto increment id plugin setting
/*QuizSchema.plugin(autoIncrement.plugin, 'Quiz');
UserQuizSchema.plugin(autoIncrement.plugin, 'UserQuiz');
QuestionSchema.plugin(autoIncrement.plugin, 'Question');
AnswerSchema.plugin(autoIncrement.plugin, 'Answer');
QuizQuestionSchema.plugin(autoIncrement.plugin, 'QuizQuestion');
FeedbackSchema.plugin(autoIncrement.plugin, 'Feedback');
UserScoreSchema.plugin(autoIncrement.plugin, 'UserScore');*/


var Quiz  = mongoose.model('Quiz', QuizSchema);
var UserQuiz  = mongoose.model('UserQuiz', UserQuizSchema);
var Question  = mongoose.model('Question', QuestionSchema);
var Answer  = mongoose.model('Answer', AnswerSchema);
var QuizQuestion  = mongoose.model('QuizQuestion', QuizQuestionSchema);
var Feedback = mongoose.model('Feedback', FeedbackSchema);
var UserScore = mongoose.model('UserScore', UserScoreSchema);
var VideoSection = mongoose.model('VideoSection', VideoSectionSchema);
var Video = mongoose.model('Video', VideoSchema);
var Poll = mongoose.model('Poll', PollSchema);
var Contact = mongoose.model('Contact', ContactSchema);

var Training = mongoose.model('Training', TrainingSchema);
var UserTraining = mongoose.model('UserTraining', UserTrainingSchema);
var TrainingQuiz  = mongoose.model('TrainingQuiz', TrainingQuizSchema);
var TrainingChecker  = mongoose.model('TrainingChecker', TrainingCheckerSchema);


module.exports.Quiz = Quiz;
module.exports.UserQuiz = UserQuiz;
module.exports.Question = Question;
module.exports.Answer = Answer;
module.exports.QuizQuestion = QuizQuestion;
module.exports.Feedback = Feedback;
module.exports.UserScore = UserScore;
module.exports.VideoSection = VideoSection;
module.exports.Video = Video;
module.exports.Poll = Poll;
module.exports.Contact = Contact;
module.exports.Training = Training;
module.exports.UserTraining = UserTraining;
module.exports.TrainingQuiz = TrainingQuiz;
module.exports.TrainingChecker = TrainingChecker;


/*
var AbcSchema = Schema({
    text: String
});
var Abc = mongoose.model('Abc', AbcSchema);
module.exports.Abc = Abc;
*/
