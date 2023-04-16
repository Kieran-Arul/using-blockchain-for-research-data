pragma solidity 0.5.16;

contract HelloWorld {

  uint private a;

  function hi() public pure returns (string memory) {
    return ("Hello World");
  }

  function setA(uint _a) public {
    a = _a;
  }

  function getA() public view returns (uint) {
    return a;
  }

}
