const User = artifacts.require ("./User.sol");
const ResearchSurvey = artifacts.require ("./ResearchSurvey.sol");
const ResearchList = artifacts.require ("./ResearchList.sol");

module.exports = async function(deployer) {

    await deployer.deploy(User);
    const userContractInstance = await User.deployed();

    await deployer.deploy(ResearchSurvey, userContractInstance.address);

    const researchSurveyContractInstance = await ResearchSurvey.deployed();

    await deployer.deploy(ResearchList, researchSurveyContractInstance.address);

}