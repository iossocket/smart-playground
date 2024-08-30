// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract LogicV1 {
    uint public count;

    function inc() external {
        count += 1;
    }
}

contract LogicV2 {
    uint public count;

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }

    function getAdmin() public pure returns (address) {
        return address(1);
    }

    function getImplementation() public pure returns (address) {
        return address(2);
    }
}

contract UnstructuredProxy {
    bytes32 private constant logicPosition =
        keccak256("org.zeppelinos.proxy.implementation");
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function upgradeTo(address newLogic) public {
        require(msg.sender == admin, "permission denied");
        setLogic(newLogic);
    }

    function logic() public view returns (address impl) {
        bytes32 position = logicPosition;
        assembly {
            impl := sload(position)
        }
    }

    function setLogic(address newLogic) internal {
        bytes32 position = logicPosition;
        assembly {
            sstore(position, newLogic)
        }
    }

    function _delegate(address _logic) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly block
            // because it will not return to Solidity code. we overwrite the Solidity scratch pad at memory position 0.

            // calldatacopy(t, f, s) - copy s bytes from calldata at position f to mem at position t
            // calldatasize() - size of call data in bytes
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.

            // delegatecall(g, a, in, insize, out, outsize) -
            // - call contract at address a
            // - with input mem[in...(in+insize)]
            // - providing g gas
            // - and output area mem[out...(out+outsize)]
            // - returning 0 on error (eg. out of gas) and 1 on success
            let result := delegatecall(gas(), _logic, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            // returndatacopy(t, f, s) - copy s bytes from returndata at position f to mem at positng t
            // returndatasize() - size of the last returndata
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error
            case 0 {
                revert(0, returndatasize())
            }
            default {
                // return(p, s) - end execution, return data mem[p...(p+s)]
                return(0, returndatasize())
            }
        }
    }

    fallback() external {
        _delegate(logic());
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    // Public and external functions cannot return storage references.
    // 返回的这个 storage 是运行时动态生成的，它指向了通过参数 slot 指定的存储位置
    function getAddressSlot(
        bytes32 slot
    ) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}

contract TestSlot {
    bytes32 public constant SLOT = keccak256("TEST_SLOT");

    function getSlot() external view returns (address) {
        return StorageSlot.getAddressSlot(SLOT).value;
    }

    function writeSlot(address _addr) external {
        StorageSlot.getAddressSlot(SLOT).value = _addr;
    }
}

// transparent proxy (final version)
contract Proxy {
    bytes32 public constant IMPLEMENTATION_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 public constant ADMIN_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.admin")) - 1);

    constructor() {
        _setAdmin(msg.sender);
    }

    function _delegate(address _implementation) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly block
            // because it will not return to Solidity code. we overwrite the Solidity scratch pad at memory position 0.

            // calldatacopy(t, f, s) - copy s bytes from calldata at position f to mem at position t
            // calldatasize() - size of call data in bytes
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.

            // delegatecall(g, a, in, insize, out, outsize) -
            // - call contract at address a
            // - with input mem[in...(in+insize)]
            // - providing g gas
            // - and output area mem[out...(out+outsize)]
            // - returning 0 on error (eg. out of gas) and 1 on success
            let result := delegatecall(
                gas(),
                _implementation,
                0,
                calldatasize(),
                0,
                0
            )

            // Copy the returned data.
            // returndatacopy(t, f, s) - copy s bytes from returndata at position f to mem at positng t
            // returndatasize() - size of the last returndata
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error
            case 0 {
                revert(0, returndatasize())
            }
            default {
                // return(p, s) - end execution, return data mem[p...(p+s)]
                return(0, returndatasize())
            }
        }
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    fallback() external {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }

    function upgradeTo(address _implementation) external {
        require(msg.sender == _getAdmin(), "not authorized");
        _setImplementation(_implementation);
    }

    function changeAdmin(address _admin) external ifAdmin {
        _setAdmin(_admin);
    }

    function _getAdmin() private view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    function _setAdmin(address _admin) private {
        require(_admin != address(0), "admin = 0 address");
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = _admin;
    }

    function _getImplementation() private view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _setImplementation(address _implementation) private {
        require(
            _implementation != address(0),
            "_implementation is not a contract"
        );
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = _implementation;
    }

    function admin() public ifAdmin returns (address) {
        return _getAdmin();
    }

    function implementation() public ifAdmin returns (address) {
        return _getImplementation();
    }
}

contract ProxyAdmin {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function changeProxyAdmin(
        address payable proxy,
        address _admin
    ) external onlyOwner {
        Proxy(proxy).changeAdmin(_admin);
    }

    function upgrade(address payable proxy, address _impl) external onlyOwner {
        Proxy(proxy).upgradeTo(_impl);
    }

    // Staticcall is a method similar to call, but it does not allow changing the state of the blockchain.
    // This means that we cannot use staticcall if the called function changes some state variable
    function getProxyAdmin(address proxy) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.admin, ())
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function getProxyImplementation(
        address proxy
    ) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.implementation, ())
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }
}
