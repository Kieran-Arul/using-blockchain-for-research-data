const ResearchProjects = artifacts.require ("./ResearchProjects.sol");

module.exports = function(deployer) {
  deployer.deploy(ResearchProjects);
}