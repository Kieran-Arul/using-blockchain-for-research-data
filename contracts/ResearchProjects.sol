// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

contract ResearchProjects {

    struct Participant {
        string id;
        bool willShare;
    }

    mapping(string => Participant[]) private participants;

    mapping(string => string) private hashes;

    function addParticipant(string memory _surveyId, string memory _userId, bool _willShare) public  {
        Participant memory participant = Participant(_userId, _willShare);
        participants[_surveyId].push(participant);
    }

    function setSharingPreference(string memory _surveyId, string memory _userId, bool _willShare) public  {

        for (uint i = 0; i < participants[_surveyId].length; i++) {

            if (keccak256(abi.encodePacked(participants[_surveyId][i].id)) == keccak256(abi.encodePacked(_userId))) {
                participants[_surveyId][i].willShare = _willShare;
            }

        }

    }

    function isSharable(string memory _surveyId) public view returns (bool) {

        for (uint i = 0; i < participants[_surveyId].length; i++) {

            if (!participants[_surveyId][i].willShare) {
                return false;
            }

        }

        return true;

    }

    function addHash(string memory _id, string memory _hash) public  {
        hashes[_id] = _hash;
    }

    function getHash(string memory _id) public view returns (string memory) {
        return hashes[_id];
    }

}
