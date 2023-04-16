// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

contract ResearchProjects {

    struct Participant {
        string id;
        bool willShare;
    }

    mapping(string => Participant[]) private participants;

    mapping(string => string) private hashes;

    mapping(string => bool) private sharingPreferences;

    function addParticipant(string memory _surveyId, string memory _userId, bool _willShare) public  {
        Participant memory participant = Participant(_userId, _willShare);
        participants[_surveyId].push(participant);
    }

    function isSharable(string memory _surveyId) public returns (bool) {

        Participant[] storage surveyParticipants = participants[_surveyId];

        for (uint i = 0; i < surveyParticipants.length; i++) {

            if (!surveyParticipants[i].willShare) {
                return false;
            }

        }

        return true;

    }

    function addHash(string memory _id, string memory _hash) public  {
        hashes[_id] = _hash;
    }

    function getHash(string memory _id) public returns (string memory) {
        return hashes[_id];
    }

    function setSharingPreference(string memory _id, bool _willShare) public  {
        sharingPreferences[_id] = _willShare;
    }

    function getSharingPreference(string memory _id) public returns (bool) {
        return sharingPreferences[_id];
    }

}
