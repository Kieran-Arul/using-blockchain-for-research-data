pragma solidity >=0.4.22 <0.9.0;

contract User {

    string public id;
    bool public willShare;

    constructor() public {
    }

    function setId(string memory _id) public {
        id = _id;
    }

    function setSharingPreference(bool _willShare) public {
        willShare = _willShare;
    }

    function getId() public view returns (string memory) {
        return id;
    }

    function getSharingPreference() public view returns (bool) {
        return willShare;
    }

}
