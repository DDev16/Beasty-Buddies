// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./PokemonBattle.sol"; // Import the PokemonBattle contract to use ElementType



contract TamagotchiNFT is
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard,
    Pausable,
    ERC721Burnable
{
    using Counters for Counters.Counter;
    using Strings for uint256;
    using SafeMath for uint256;
    
    using Counters for Counters.Counter;

    Counters.Counter private _battleIdCounter;

    Counters.Counter private _tokenIdCounter = Counters.Counter(1);




    struct Pet {
        uint256 id;
        uint256 birthTime;
        uint256 lastInteraction;
        uint lastInteractionReset;
        uint256 level;
        uint256 happiness;
        uint256 hunger;
        string name;
        uint256 xp; // Add the new xp property
        string element;
        uint256 hp;
        uint256 power; 
    }

    string[] private elements = [
        "Fire",
        "Water",
        "Grass",
        "Electric"
        
    ];


     enum ElementType { Fire, Water, Grass, Electric }


    mapping(uint256 => Pet) public pets;
    mapping(uint256 => string) private _babyImageURIs;
    mapping(uint256 => string) private _adultImageURIs;

    uint256 public interactionCooldown = 0 hours;
    uint256 public cost = 0 ether;
    uint256 public constant MAX_SUPPLY = 500;
    IERC20 public rewardsToken;
    
    uint256 public constant XP_LEVEL_UP_THRESHOLD = 100;
    uint256 public REWARD_AMOUNT = 100;
    uint256 public evolveHappinessThreshold = 80;
    uint256 public evolveHungerThreshold = 20;

    string private _babyBaseURIs =
        "ipfs://bafybeia4syctcvmxenscq6c2jpwo2i3zoqbua6jwbvnylmvg2uwk5fla6m";
    string private _adultBaseURIs = "https://example.com/adult/";

    event NewPet(uint256 tokenId, uint256 birthTime);
    event Interaction(uint256 tokenId, uint256 timestamp);
    event Evolution(uint256 tokenId, uint256 newLevel, uint256 timestamp);
    event Feed(uint256 tokenId, uint256 timestamp);
    event Play(uint256 tokenId, uint256 timestamp);
    event NameChange(uint256 indexed tokenId, string newName);

    using SafeERC20 for IERC20;

    constructor(address _rewardsToken) ERC721("TamagotchiNFT", "TNFT") {
        rewardsToken = IERC20(_rewardsToken);

    }

// New function to get all pet details in a single call
    function getPetDetails(uint256 tokenId)
        public
        view
        petExists(tokenId)
        returns (
            uint256 id,
            uint256 birthTime,
            uint256 lastInteraction,
            uint256 level,
            uint256 happiness,
            uint256 hunger,
            string memory name,
            uint256 xp,
            string memory element,
            uint256 hp,
            uint256 power
        )
    {
        Pet storage pet = pets[tokenId];
        return (
            pet.id,
            pet.birthTime,
            pet.lastInteraction,
            pet.level,
            pet.happiness,
            pet.hunger,
            pet.name,
            pet.xp,
            pet.element,
            pet.hp,
            pet.power
        );
    }
    
    function getRemainingInteractionTime(uint256 tokenId) public view returns (uint256) {
    require(_exists(tokenId), "Token does not exist");
    Pet storage pet = pets[tokenId];
    uint256 lastInteraction = pet.lastInteraction;
    uint256 remainingTime = 0;

    if (block.number < lastInteraction + interactionCooldown) {
        remainingTime = lastInteraction + interactionCooldown - block.number;
    }

    return remainingTime;
}

function getLevel(uint256 tokenId) public view petExists(tokenId) returns (uint256) {
    return pets[tokenId].level;
}

function getExperience(uint256 tokenId) public view petExists(tokenId) returns (uint256) {
    return pets[tokenId].xp;
}


function getHp(uint256 tokenId) external view  returns (uint256) {
    require(_exists(tokenId), "Token does not exist");
    return pets[tokenId].hp;
}

function getPower(uint256 tokenId) external view  returns (uint256) {
    require(_exists(tokenId), "Token does not exist");
    // Calculate power based on your preferred formula
    uint256 power = pets[tokenId].level * 10; // Example formula: level * 10
    return power;
}

function getElementType(uint256 tokenId) external view  returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    return pets[tokenId].element;
}


    function increaseXP(uint256 tokenId, uint256 xpAmount) external {
        require(_exists(tokenId), "Token does not exist");

        Pet storage pet = pets[tokenId];
        pet.xp = pet.xp.add(xpAmount);

        // Check if the pet should level up
        if (pet.xp >= XP_LEVEL_UP_THRESHOLD) {
            pet.level = pet.level.add(1);
            pet.xp = pet.xp.sub(XP_LEVEL_UP_THRESHOLD);
        }
    }


  function getSuperpower(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    return pets[tokenId].element;
}


    modifier petExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    function withdrawIERC20(address tokenAddress, uint256 amount)
        external
        onlyOwner
    {
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
    }

    function getAge(uint256 tokenId)
        public
        view
        petExists(tokenId)
        returns (uint256)
    {
        Pet storage pet = pets[tokenId];
        uint256 blockDifference = block.number - pet.birthTime;
        // Approximate age in seconds, assuming an average block time of 13 seconds
        uint256 ageInSeconds = blockDifference * 13;
        return ageInSeconds / (1 days);
    }


    function mintPets(uint256 amount) public payable whenNotPaused {
        require(amount > 0 && amount <= 10, "Amount must be between 1 and 10");
        require(
            _tokenIdCounter.current() + amount <= MAX_SUPPLY,
            "Minting would exceed max supply"
        );

        uint256 requiredPayment = cost * amount;
        require(msg.value >= requiredPayment, "Insufficient payment");

       

        for (uint256 i = 0; i < amount; i++) {
            _mintPet(msg.sender);
        }
    }

    function _mintPet(address to) private {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);

        string memory babyTokenURI = _generateBabyTokenURI(tokenId);
        string memory adultTokenURI = _generateAdultTokenURI(tokenId);

        _setTokenURI(tokenId, babyTokenURI);
        _adultImageURIs[tokenId] = adultTokenURI;

        Pet memory newPet = Pet({
            id: tokenId,
            birthTime: block.timestamp,
            lastInteraction: block.timestamp,
            lastInteractionReset: block.timestamp,
            level: 1,
            happiness: 100,
            hunger: 0,
            name: "Unnamed",
            xp: 0, 
            element: "",  
            hp: 100,
            power: 10       
        });

        pets[tokenId] = newPet;
        _tokenIdCounter.increment();

        emit NewPet(tokenId, newPet.birthTime);
    }


    function _generateBabyTokenURI(uint256 tokenId)
        private
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(_babyBaseURIs, tokenId.toString(), ".json")
            );
    }

    function _generateAdultTokenURI(uint256 tokenId)
        private
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(_adultBaseURIs, tokenId.toString(), ".json")
            );
    }

    function interact(uint256 tokenId) public whenNotPaused {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

         Pet storage pet = pets[tokenId];
        require(
            block.timestamp >= pet.lastInteraction + interactionCooldown,
            "Interaction is on cooldown"
        );

        pet.lastInteraction = block.timestamp;
        pet.happiness = pet.happiness + 10;
       

        if (pet.happiness > 100) {
            pet.happiness = 100;
        }

        if (pet.hunger > 100) {
            pet.hunger = 100;
        }

        emit Interaction(tokenId, block.timestamp);
    }

    function setName(uint256 tokenId, string memory newName) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

        Pet storage pet = pets[tokenId];
        pet.name = newName;

    emit NameChange(tokenId, newName);

    }


    function feed(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

        Pet storage pet = pets[tokenId];
        require(
            block.timestamp >= pet.lastInteraction + interactionCooldown,
            "Interaction is on cooldown"
        );

        pet.lastInteraction = block.timestamp;
        pet.hunger = pet.hunger - 20;

        if (pet.hunger < 0) {
            pet.hunger = 0;
        }
        emit Feed(tokenId, block.timestamp);
    }

    function play(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

        Pet storage pet = pets[tokenId];
        require(
            block.timestamp >= pet.lastInteraction + interactionCooldown,
            "Interaction is on cooldown"
        );

        pet.lastInteraction = block.timestamp;
        pet.happiness = pet.happiness + 20;
        pet.hunger = pet.hunger + 10;

        if (pet.happiness > 100) {
            pet.happiness = 100;
        }

        emit Play(tokenId, block.timestamp);
    }

    function evolve(uint256 tokenId) public whenNotPaused {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");

        Pet storage pet = pets[tokenId];
        require(
            pet.happiness >= evolveHappinessThreshold &&
                pet.hunger <= evolveHungerThreshold,
            string(
                abi.encodePacked(
                    "Pet happiness must be at least ",
                    evolveHappinessThreshold.toString(),
                    " and hunger must be ",
                    evolveHungerThreshold.toString(),
                    " or below to evolve"
                )
            )
        );

        pet.level++;
        pet.happiness = 50;
        pet.hunger = 50;

                pet.lastInteraction = block.timestamp;


        // If the pet reaches level 2, assign a random superpower
        if (pet.level == 2) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, tokenId)
                )
            ) % elements.length;
            pet.element = elements[randomIndex];
            string memory adultImageURI = _adultImageURIs[tokenId];
            require(
                bytes(adultImageURI).length > 0,
                "Adult image URI not set for this token"
            );
            _setTokenURI(tokenId, adultImageURI);
        }

        // Reward the owner with tokens
        rewardsToken.safeTransfer(msg.sender, REWARD_AMOUNT);
        

        emit Evolution(tokenId, pet.level, block.timestamp);
    }

    


    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getImageCID(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Pet storage pet = pets[tokenId];
        if (pet.level < 2) {
            return _generateBabyTokenURI(tokenId);
        } else {
            return _adultImageURIs[tokenId];
        }
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getLevelAndExperience(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256, uint256)
{
    Pet storage pet = pets[tokenId];
    return (pet.level, pet.xp);
}


    
}

interface ITamagotchi {
    function getHp(uint256 tokenId) external view returns (uint256);
    function getPower(uint256 tokenId) external view returns (uint256);
    function getElementType(uint256 tokenId) external view returns (string memory);
    function updateAfterBattle(uint256 tokenId, uint256 xp) external;
    function increaseXP(uint256 tokenId, uint256 xpAmount) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function getLevel(uint256 tokenId) external view returns (uint256); 
    function getExperience(uint256 tokenId) external view returns (uint256);
    function getLevelAndExperience(uint256 tokenId) external view returns (uint256, uint256);
 
}