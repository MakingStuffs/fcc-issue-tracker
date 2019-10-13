'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
const helmet      = require('helmet');
const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const mongo             = require('mongodb').MongoClient;
const mongoose          = require('mongoose');
const app = express();
app.use(helmet());
app.use('/public', express.static(process.cwd() + '/public'));
mongoose.set('useCreateIndex', true);

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);
// Connect mongoose to the database
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
// Mongoose schemas
const projectSchema = {
  name: {
    type: String,
    unique: true,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  created_on: {
    type: Date
  },
  issues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  issue_count: {
    type: Number
  }
};
const issueSchema = {
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  created_on: {
    type: Date
  },
  assigned_to: {
    type: String,
  },
  updated_on: {
    type: Date
  },
  status_text: {
    type: String
  },
  open: {
    type: Boolean
  }
};
// Mongoose models
const Project = new mongoose.model('Project', projectSchema);
const Issue = new mongoose.model('Issue', issueSchema);
  //Routing for API 
  apiRoutes(app, Project, Issue);  
    
  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 3500);
    }
  });

module.exports = app; //for testing
