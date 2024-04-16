// requiring the contract
var User = artifacts.require("./User.sol");

// exporting as module 
 module.exports = function(deployer) {
  deployer.deploy(User);
 };
