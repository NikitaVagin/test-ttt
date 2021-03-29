const ICOContract = artifacts.require('ICO');

module.exports = function(deployer, network, accounts) {
    // Use deployer to state migration tasks.
    deployer.deploy(ICOContract, accounts[0]);
};
