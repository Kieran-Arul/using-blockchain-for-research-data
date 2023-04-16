pragma solidity >=0.4.22 <0.9.0;

import "./ResearchSurvey.sol";

contract ResearchList {

    ResearchSurvey[] public currentResearch;
    address public researchSurveyContractAddress;

    constructor(address _researchSurveyContractAddress) public {
        researchSurveyContractAddress = _researchSurveyContractAddress;
        currentResearch = new ResearchSurvey[](5);
    }

    function getResearchById(string memory id) private view returns (ResearchSurvey) {

        for (uint i = 0; i < currentResearch.length; i++) {
            if (keccak256(abi.encodePacked(currentResearch[i].getId())) == keccak256(abi.encodePacked(id))) {
                return currentResearch[i];
            }
        }

        revert("Research Survey Not Found!");

    }

    function getParticipantsOfSurvey(string memory id) private view returns (User[] memory) {

        ResearchSurvey survey = getResearchById(id);

        return survey.getParticipants();
    }

    function addResearch(string memory id) public {

        ResearchSurvey survey = new ResearchSurvey(researchSurveyContractAddress);

        survey.setId(id);

        currentResearch.push(survey);

    }

    function addParticipantToSurvey(string memory id, string memory userId, bool willShare) public {

        ResearchSurvey survey = getResearchById(id);

        survey.addParticipant(userId, willShare);
    }

    function getResearchHash(string memory id) public view returns (string memory) {

        ResearchSurvey survey = getResearchById(id);

        return survey.getHash();
    }

    function setResearchHash(string memory id, string memory newHash) public {

        ResearchSurvey survey = getResearchById(id);

        survey.setHash(newHash);
    }

    function isSharableResearch(string memory id) public view returns (bool) {

        ResearchSurvey survey = getResearchById(id);

        return survey.isSharable();
    }

}
