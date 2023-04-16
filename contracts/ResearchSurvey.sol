pragma solidity >=0.4.22 <0.9.0;

import "./User.sol";

contract ResearchSurvey {

    string public id;
    User[] public participants;
    string public hash;
    address public userContractAddress;

    constructor(address _userContractAddress) public {
        id = "0";
        hash = "0";
        userContractAddress = _userContractAddress;
        participants = new User[](5);
    }

    function setId(string memory _id) public {
        id = _id;
    }

    function getId() public view returns (string memory) {
        return id;
    }

    function getHash() public view returns (string memory) {
        return hash;
    }

    function setHash(string memory newHash) public {
        hash = newHash;
    }

    function getParticipants() public view returns (User[] memory) {
        return participants;
    }

    function addParticipant(string memory userId, bool willShare) public {

        User user = new User();
        user.setId(userId);
        user.setSharingPreference(willShare);

        participants.push(user);
    }

    function isSharable() public view returns (bool) {

        for (uint i = 0; i < participants.length; i++) {

            if (!participants[i].getSharingPreference()) {
                return false;
            }

        }

        return true;
    }

}
