// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * Fire Horse NFT Contract
 * ERC721 NFT with signature-based minting and IPFS metadata support
 * Year of the Dragon - 2026
 */
contract FireHorseNFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    // NFT Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Backend signer address for validating mints
    address public signerAddress;

    // Metadata storage
    mapping(uint256 => string) private _tokenMetadataCID; // Token ID -> IPFS Metadata CID

    // Events
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string ipfsMetadataCID,
        string creatureName
    );

    event SignerUpdated(address indexed newSigner);

    /**
     * Constructor
     * @param _signer Backend address that signs valid mint requests
     */
    constructor(address _signer) ERC721("Fire Horse NFT", "FHNFT") Ownable(msg.sender) {
        require(_signer != address(0), "Invalid signer address");
        signerAddress = _signer;
        _tokenIdCounter.increment(); // Start IDs from 1
    }

    /**
     * Mint NFT with signature validation and IPFS metadata
     * Called by user after backend validates requirements and creates signature
     * 
     * @param signature Backend signature validating this mint
     * @param ipfsMetadataCID IPFS hash of metadata JSON
     */
    function mintWithSignature(
        bytes calldata signature,
        string calldata ipfsMetadataCID
    ) external {
        // Validate inputs
        require(bytes(ipfsMetadataCID).length > 0, "Metadata CID required");

        // Create message hash from sender address + metadata hash
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, ipfsMetadataCID));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Verify signature comes from authorized signer
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(
            recoveredSigner == signerAddress,
            "Invalid signature - mint not authorized"
        );

        // Mint the NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Set IPFS metadata URI
        string memory tokenURI = string(abi.encodePacked("ipfs://", ipfsMetadataCID));
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store metadata CID for future reference
        _tokenMetadataCID[tokenId] = ipfsMetadataCID;

        // Emit event (parse creature name from metadata if needed in future)
        emit NFTMinted(msg.sender, tokenId, ipfsMetadataCID, "Fire Horse Creature");
    }

    /**
     * Get current token ID counter (for UI display)
     */
    function getNextTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * Get IPFS metadata CID for a token
     */
    function getTokenMetadataCID(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenMetadataCID[tokenId];
    }

    /**
     * Owner function: Update signer address
     */
    function updateSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        signerAddress = newSigner;
        emit SignerUpdated(newSigner);
    }

    /**
     * Override tokenURI to support IPFS
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * Override supportsInterface for ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * Required by burn functionality (if extended later)
     */
    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }
}