/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.isNotNull(res.body.issue_title);
          assert.isNotNull(res.body.issue_text);
          assert.isNotNull(res.body.created_by);
          assert.isNotNull(res.body.assigned_to);
          assert.isNotNull(res.body.status_text);
          assert.isNotNull(res.body.created_on);
          assert.isNotNull(res.body.updated_on);
          assert.isNotNull(res.body.project_id);
          assert.isNotNull(res.body._id);
          assert.equal(res.status, 200);
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.isNotNull(res.body.issue_title, 'Title is empty');
          assert.isNotNull(res.body.issue_text, 'Text is empty');
          assert.isNotNull(res.body.created_by, 'Created_by is empty');
          assert.equal(res.status, 200);
          done();
        });      
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          status_text: "A status"
        })
        .end((err, res) => {
          assert.isNotNull(res.body.issue_title);
          assert.isNotNull(res.body.issue_text);
          assert.isNotNull(res.body.created_by);         
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.body.error, "No data sent");
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: "5da20d823a69034d6149a58e",
          issue_text: "Updated in one field test"
        })
        .end((err, res) => {
          assert.equal(res.body.issue_text, "Updated in one field test");
          done();
        });
        
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: "5da20d823a69034d6149a58e",
          issue_title: "New Title",
          status_text: "Status bitch",
        })
        .end((err, res) => {
          assert.equal(res.body.issue_title, "New Title");
          assert.equal(res.body.status_text, "Status bitch");
          done();
        });
        
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/apitest')
        .query({created_by: "dad"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(doc => {
            assert.equal(doc.created_by, "dad");
          });
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/apitest')
        .query({created_by: "dad", assigned_to: "gran"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(doc => {
            assert.equal(doc.created_by, "dad");
            assert.equal(doc.assigned_to, "gran");
          });
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/apitest')
        .end((err, res) => {
          assert.isNotNull(res.body.error);
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/apitest')
        .send({_id: "5da20efb0e373d5476b4495e"})
        .end((err, res) => {
          assert.isNotNull(res.body.success);
          done();
        });  
      });
      
    });

});
