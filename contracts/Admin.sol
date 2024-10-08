// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./interfaces/IAdmin.sol";

contract Admin is IAdmin {
    address[] public admins;
    mapping(address => bool) private _isAdmin;

    modifier onlyAdmin() {
        require(_isAdmin[msg.sender], "Only admin can access");
        _;
    }

    constructor(address[] memory admins_) {
        for (uint256 i = 0; i < admins_.length; i++) {
            admins.push(admins_[i]);
            _isAdmin[admins_[i]] = true;
        }
    }

    function addAdmin(address newAdmin) external onlyAdmin {
        require(
            newAdmin != address(0x0),
            "[RBAC] : Admin must be != than 0x0 address"
        );

        require(!_isAdmin[newAdmin], "[RBAC] : Admin already exists.");

        admins.push(newAdmin);
        _isAdmin[newAdmin] = true;
    }

    function removeAdmin(address targetAdmin) external onlyAdmin {
        require(_isAdmin[targetAdmin], "[RBAC] : Admin not exists.");
        uint i = 0;
        while (admins[i] != targetAdmin) {
            if (i == admins.length - 1) {
                revert("Passed admin address does not exist");
            }
            i += 1;
        }
        admins[i] = admins[admins.length - 1];
        _isAdmin[targetAdmin] = false;

        admins.pop();
    }

    function getAllAdmins() external view returns (address[] memory) {
        return admins;
    }

    function isAdmin(address user) external view override returns (bool) {
        return _isAdmin[user];
    }
}
