// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lock {
    uint public value;

    constructor() payable {
        value = 10;
    }

    function setValue(uint _value) public {
        value = _value;
    }

    function getValue() public view returns(uint) {
        return value;
    }

}
