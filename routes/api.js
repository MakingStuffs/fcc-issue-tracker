/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');

module.exports = function (app, Project, Issue) {
  // Set the route to use for the api
  app.route('/api/issues/:project')
    // Define the get function
    .get(function (req, res){
      // Get the project name
      let name = req.params.project;
      // Check it isn't null
      if(name !== null){
        // Check if it already exists in the database
        Project.findOne({ name })
          // Populate the issues array if it does
          .populate({
            path: 'issues',
            match: {
              ...req.query
            }
          })
          .exec((err, doc) => {
            // Error check
            if(err)
              return res.json({error: err});
            if(!doc)
              return res.json({error: `No project matching '${name}'`});
          /*
            // Get the queried parameters, if any exist
            let filters = Object.keys(req.query);
            // Check whether to filter the results
            if(filters.length > 0) {
              console.log('More than one param -- GET');
              let filteredDocs = doc.issues.filter(issue => {
                filters.forEach(filter => {
                  issue[filter] === req.query[filter];
                });
              });
              console.log(filteredDocs);
              return res.json(filteredDocs);
            // Otherwise just return all documents
            } else {
              // filter by params
              return res.json(doc);
            }
          */
            // filter by params
            return res.json(doc.issues);
          });
      } else {
        res.json({ error: "You must specify a project name" });
      }
    })
    // Define the post function
    .post(function (req, res, next){
      // Get the name of the project
      let projectName = req.params.project;
      // Make sure the require fields are filled in
      if(!projectName)
        return res.json({error: "You did not specify a project name"});
      if(!req.body.issue_text)
        return res.json({error: "You did not specify issue_text"});
      if(!req.body.issue_title)
        return res.json({error: "You did not specify issue_title"});
      if(!req.body.created_by)
        return res.json({error: "You did not specify created_by"});
      //Check to see if a project with the specified name exists already
      Project.findOne({name: projectName}, (err, project) => {
      // Define the issue object
      let newIssue = new Issue({
        _id: mongoose.Types.ObjectId(),
        issue_text: req.body.issue_text,
        issue_title: req.body.issue_title,
        created_by: req.body.created_by,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });
      // Add optional values
      req.body.assigned_to ?
        newIssue.assigned_to = req.body.assigned_to :
        newIssue.assigned_to = '';
      req.body.status_text ?
        newIssue.status_text = req.body.status_text :
        newIssue.status_text = '';
        // Check for errors
        if(err)
          // Return error if there is one
          return console.log('error find project');
        
        // If the project name is unique
        if(!project) {
          console.log('New project detected');
          // Create a new project object
          let newProject = new Project({
            _id: mongoose.Types.ObjectId(),
            name: req.params.project,
            created_by: req.body.created_by,
            created_on: new Date(),
            issues: [].concat(newIssue),
            issue_count: 1
          }); 
          // Save the new project
          newProject.save((err, savedProject) => {
            console.log('Saved project');
          });
          // Bind the project id to the issue
          newIssue.project_id = newProject._id;
          // Save the new issue
          newIssue.save((err, savedIssue) => {
            return res.json(savedIssue);
          }); 
          
        // If the project already exists Check if the issue does
        } else {
          console.log('Project exists, checking issue');
          // Check to see if the issue is new
          Issue.findOne({issue_title: req.body.issue_title}, (err, issue) => {
            // Handle error
            if(err)
              return console.log('error');
            // Check if the issue exists
            if(issue) {
              console.log('Issue already exists');
              return res.json(issue);
            // If it is a new issue
            } else {
              console.log(`Issue does not exist, adding it to ${project.name}`);
              // Bind the project id to the issue
              newIssue.project_id = project._id;
              // Save the new issue
              newIssue.save((err, savedIssue) => {
                // Push it to the project's array
                project.issues = project.issues.concat(savedIssue);
                // Update the project's issue count
                project.issue_count = project.issues.length;
                // Save the updated project
                project.save((err, updatedProject) => {
                  return res.json(savedIssue);
                });
              });
            }
          });
        }
      });  
    
    })
    // Define the put function -- This will update the issue
    .put(function (req, res){
      // Ensure there is an ID
      if(!req.body._id)
        return res.json({error: "No data sent"});
      // Set the ID variable
      let id = req.body._id;
      // Get a filtered list of fields to update
      let fieldsToUpdate = (Object.keys(req.body)).filter( key => key !== '_id' && req.body[key] !== '');
      // If no fields then return an error
      if(fieldsToUpdate.length < 1)
        return res.json({error: "You have not specified a field to update"});
      // Query the database for the issue
      Issue.findById(id, (err, issue) => {
        // Iterate the array of fields to update
        fieldsToUpdate.forEach(field => {
          // Update each field
          issue[field] = req.body[field]; 
        });
        // Update the last updated field
        issue.updated_on = new Date();
        // Save the updated issue
        issue.save((err, updatedDoc) => {
          if(err)
            return res.json(err);
          // Return a JSON with the updated issue
          return res.json(updatedDoc);
        })
      });
    })
    // Define the delete function
    .delete(function (req, res){
      var project = req.params.project;
      let id = req.body._id;
      if(!id)
        return res.json({error: "No ID provided"});
      Issue.findByIdAndDelete(id, (err, doc) => {
        return res.json({success: `Success, item ${id} is now deleted`});
      });
    });
};
