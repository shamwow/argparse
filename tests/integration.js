#!/usr/bin/env node

var ArgParser = require('../index.js'),
    cmd = new ArgParser();


cmd
  .register('global <test>', function (test){
    console.log('test 1', test);
  })
  .register('user <age> <name> <siblings, 2> [coolness]', function (){
    console.log('hello', arguments);
  })
  .register('sub [hello]', function(hello){
    console.log('test 2', hello);
  })
  .register('sub2 <hello, 2>...', function (hello){
    console.log('test 3', hello);
  })
  .register('sub3 [hello, 2]...', function (hello){
    console.log('test 4', hello);
  })
  .register('sub4 [hello]...', function (hello){
    console.log('test 5', hello);
  }).parse();
