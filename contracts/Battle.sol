// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "contracts/UpdatedGotchiToma.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UpdatePokemonBattle is ERC721 {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _battleIdCounter;

    ITamagotchi public tamagotchiNFT;

    enum ElementType {
        Fire,
        Water,
        Grass,
        Electric
    }

    enum ItemType {
    None,
    Shield,
    Potion,
    PowerUp
}

// Add the isActive property to the Item struct
struct Item {
    ItemType itemType;
    uint256 effectValue;
    bool isActive;
    uint256 useCount; // Add this line // Add this line
}

    struct Battle {
        uint256 attackerTokenId;
        uint256 defenderTokenId;
        uint256 attackerHp;
        uint256 defenderHp;
        uint256 attackerPower;
        uint256 defenderPower;
        uint256 attackerLevel;
        uint256 attackerExperience;
        uint256 defenderLevel;
        uint256 defenderExperience;
        ElementType attackerElement;
        ElementType defenderElement;
        address attacker;
        address defender;
        
    }
    
    
    mapping(uint256 => address) public currentTurn;
    mapping(uint256 => mapping(address => Item[])) public battleItems;
    mapping(address => Item[]) public playerItems; // Store an array of items for each player
    mapping(uint256 => mapping(address => mapping(ItemType => uint256))) public itemUsageCounter;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    mapping(uint256 => bool) public battleIsActive;
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256) public lastBattleTime;
    IERC20 public rewardToken;

    uint256 public constant REWARD_AMOUNT = 1000;
    uint256 public constant MAX_LEVEL_DIFFERENCE = 5;
    uint256 public constant COOLDOWN_PERIOD = 86400; // 1 day
    
    event NewBattle(
        uint256 indexed battleId,
        uint256 attackerTokenId,
        uint256 defenderTokenId
    );
    event BattleUpdate(
        uint256 indexed battleId,
        uint256 attackerHp,
        uint256 defenderHp
    );
    event BattleEnded(uint256 indexed battleId, uint256 winnerTokenId);
    event CriticalHit(uint256 indexed battleId, uint256 attackerTokenId);
    event CriticalMiss(uint256 indexed battleId, uint256 attackerTokenId);
    event ItemUsed(uint256 indexed battleId, ItemType indexed itemType, address indexed user);
  

// Sample array of item names
   string[] public itemNames = ["Sheild", "Potion", "Power Up"];


    constructor(address _tamagotchiNFTAddress, address _rewardTokenAddress)
        ERC721("PokemonBattle", "PB")
    {
        tamagotchiNFT = ITamagotchi(_tamagotchiNFTAddress);
        rewardToken = IERC20(_rewardTokenAddress);
    }

    function calculateScore(uint256 wins, uint256 losses) public pure returns (uint256) {
uint256 winPoints = wins.mul(100);
uint256 lossPoints = losses.mul(20);
return winPoints.sub(lossPoints);
}



function updateLeaderboard(uint256 battleId) internal {
Battle storage battle = battles[battleId];


if (battle.attackerHp == 0) {
    playerWins[battle.defender] = playerWins[battle.defender].add(1);
    playerLosses[battle.attacker] = playerLosses[battle.attacker].add(1);
} else if (battle.defenderHp == 0) {
    playerWins[battle.attacker] = playerWins[battle.attacker].add(1);
    playerLosses[battle.defender] = playerLosses[battle.defender].add(1);
}
}

function getScore(address player) public view returns (uint256) {
return calculateScore(playerWins[player], playerLosses[player]);
}

   function createBattle(uint256 attackerTokenId, uint256 defenderTokenId)
    public
{
    address attacker = tamagotchiNFT.ownerOf(attackerTokenId);

    require(attacker == msg.sender, "You must own the attacker token");
    require(
        tamagotchiNFT.ownerOf(defenderTokenId) != msg.sender,
        "You cannot battle against your own token"
    );

    // Enforce the cooldown period only for the attacker
    require(
        block.timestamp >= lastBattleTime[attacker] + COOLDOWN_PERIOD,
        "Cooldown period has not passed yet for the attacker"
    );

    (uint256 attackerLevel, uint256 attackerExperience) = tamagotchiNFT
        .getLevelAndExperience(attackerTokenId);
    (uint256 defenderLevel, uint256 defenderExperience) = tamagotchiNFT
        .getLevelAndExperience(defenderTokenId);

    // Check if the level difference between attacker and defender is within the allowed range
    require(
        (attackerLevel >= defenderLevel &&
            attackerLevel <= defenderLevel + MAX_LEVEL_DIFFERENCE) ||
            (attackerLevel <= defenderLevel &&
                attackerLevel + MAX_LEVEL_DIFFERENCE >= defenderLevel),
        "Level difference between attacker and defender is too high"
    );

    uint256 battleId = _battleIdCounter.current();
    _battleIdCounter.increment();

    battles[battleId] = _createBattleStruct(
        attackerTokenId,
        defenderTokenId,
        attackerLevel,
        attackerExperience,
        defenderLevel,
        defenderExperience
    );
    battleIsActive[battleId] = true;
    _assignPlayerItemsToBattle(battleId); // Add this line

    emit NewBattle(battleId, attackerTokenId, defenderTokenId);

    currentTurn[battleId] = attacker;

    // Update the lastBattleTime only for the attacker at the end of the function
    lastBattleTime[attacker] = block.timestamp;


}


    // Add this function to assign the player's items when a new battle is created
 function _assignPlayerItemsToBattle(uint256 battleId) internal {
    Battle storage battle = battles[battleId];
    for (uint256 i = 0; i < playerItems[battle.attacker].length; i++) {
        battleItems[battleId][battle.attacker].push(playerItems[battle.attacker][i]);
    }
    for (uint256 i = 0; i < playerItems[battle.defender].length; i++) {
        battleItems[battleId][battle.defender].push(playerItems[battle.defender][i]);
    }
}


    function _createBattleStruct(
        uint256 attackerTokenId,
        uint256 defenderTokenId,
        uint256 attackerLevel,
        uint256 attackerExperience,
        uint256 defenderLevel,
        uint256 defenderExperience
    ) internal view returns (Battle memory) {
        uint256 attackerHp = tamagotchiNFT.getHp(attackerTokenId);
        uint256 defenderHp = tamagotchiNFT.getHp(defenderTokenId);
        uint256 attackerPower = tamagotchiNFT.getPower(attackerTokenId);
        uint256 defenderPower = tamagotchiNFT.getPower(defenderTokenId);
        ElementType attackerElement = stringToElementType(
            tamagotchiNFT.getElementType(attackerTokenId)
        );
        ElementType defenderElement = stringToElementType(
            tamagotchiNFT.getElementType(defenderTokenId)
        );

        return
            Battle({
                attackerTokenId: attackerTokenId,
                defenderTokenId: defenderTokenId,
                attackerHp: attackerHp,
                defenderHp: defenderHp,
                attackerPower: attackerPower,
                defenderPower: defenderPower,
                attackerLevel: attackerLevel,
                attackerExperience: attackerExperience,
                defenderLevel: defenderLevel,
                defenderExperience: defenderExperience,
                attackerElement: attackerElement,
                defenderElement: defenderElement,
                attacker: msg.sender,
                defender: tamagotchiNFT.ownerOf(defenderTokenId)
            });
    }

    function stringToElementType(string memory element)
        internal
        pure
        returns (ElementType)
    {
        if (
            keccak256(abi.encodePacked(element)) ==
            keccak256(abi.encodePacked("Fire"))
        ) {
            return ElementType.Fire;
        } else if (
            keccak256(abi.encodePacked(element)) ==
            keccak256(abi.encodePacked("Water"))
        ) {
            return ElementType.Water;
        } else if (
            keccak256(abi.encodePacked(element)) ==
            keccak256(abi.encodePacked("Grass"))
        ) {
            return ElementType.Grass;
        } else if (
            keccak256(abi.encodePacked(element)) ==
            keccak256(abi.encodePacked("Electric"))
        ) {
            return ElementType.Electric;
        } else {
            revert("Invalid element string");
        }
    }

   function attack(uint256 battleId) public {
    Battle storage battle = battles[battleId];
    require(battleIsActive[battleId], "Battle is not active");
    require(
        battle.attacker == msg.sender || battle.defender == msg.sender,
        "You are not a participant in this battle"
    );

    require(
        currentTurn[battleId] == msg.sender,
        "It is not your turn to attack"
    );

    uint256 damage;

    if (msg.sender == battle.attacker) {
        // Calculate damage based on attacker properties
        damage = battle.attackerPower.mul(
            battle.attackerLevel + battle.attackerExperience.div(100)
        );
    } else {
        // Calculate damage based on defender properties
        damage = battle.defenderPower.mul(
            battle.defenderLevel + battle.defenderExperience.div(100)
        );
    }

    if (
        isElementStrongAgainst(
            battle.attackerElement,
            battle.defenderElement
        )
    ) {
        damage = damage.mul(2);
    } else if (
        isElementWeakAgainst(battle.attackerElement, battle.defenderElement)
    ) {
        damage = damage.div(2);
    }

    // Implement a chance of critical hits
    uint256 criticalHitChance = uint256(
        keccak256(abi.encodePacked(block.timestamp, battleId))
    ) % 10;
    if (criticalHitChance < 2) {
        // 20% chance of critical hit
        damage = damage.mul(2);
        emit CriticalHit(battleId, msg.sender == battle.attacker ? battle.attackerTokenId : battle.defenderTokenId);
    }

    // Implement a chance of critical miss
    uint256 criticalMissChance = uint256(
        keccak256(abi.encodePacked(block.timestamp, battleId, "miss"))
    ) % 10;
    if (criticalMissChance < 2) {
        // 20% chance of critical miss
        damage = 0;
        emit CriticalMiss(battleId, msg.sender == battle.attacker ? battle.attackerTokenId : battle.defenderTokenId);
    }

    if (msg.sender == battle.attacker) {
        unchecked {
            if (battle.defenderHp <= damage) {
                battle.defenderHp = 0;
                battleIsActive[battleId] = false;


                // Increase the XP of the attacker
                uint256 xpAmount = 100; // Set the XP amount you want to increase
                tamagotchiNFT.increaseXP(battle.attackerTokenId, xpAmount);

                rewardToken.transfer(battle.attacker, REWARD_AMOUNT);

                emit BattleEnded(battleId, battle.attackerTokenId);
            } else {
                battle.defenderHp = battle.defenderHp.sub(damage);
            }
        }
    } else {
        unchecked {
            if (battle.attackerHp <= damage) {
                battle.attackerHp = 0;
                battleIsActive[battleId] = false;

                  // Increase the XP of the defender
                uint256 xpAmount = 100; // Set the XP amount you want to increase
                tamagotchiNFT.increaseXP(battle.defenderTokenId, xpAmount);

                rewardToken.transfer(battle.defender, REWARD_AMOUNT);

                emit BattleEnded(battleId, battle.defenderTokenId);
            } else {
                battle.attackerHp = battle.attackerHp.sub(damage);
            }
        }
    }

    // Switch turns
    _switchTurns(battleId);

    emit BattleUpdate(battleId, battle.attackerHp, battle.defenderHp);
    updateLeaderboard(battleId);
}

    function isInActiveBattle(address user) internal view returns (bool) {
    for (uint256 i = 0; i < _battleIdCounter.current(); i++) {
        Battle memory battle = battles[i];
        if (
            battleIsActive[i] &&
            (battle.attacker == user || battle.defender == user)
        ) {
            return true;
        }
    }
    return false;
}


function usePotion(uint256 battleId) public {
    _useItem(battleId, ItemType.Potion);
}

function useShield(uint256 battleId) public {
    _useItem(battleId, ItemType.Shield);
}

function usePowerUp(uint256 battleId) public {
    _useItem(battleId, ItemType.PowerUp);
}


function _switchTurns(uint256 battleId) internal {
    Battle storage battle = battles[battleId];
    if (currentTurn[battleId] == battle.attacker) {
        currentTurn[battleId] = battle.defender;
    } else {
        currentTurn[battleId] = battle.attacker;
    }
}


    function endBattle(uint256 battleId) public  {
        Battle storage battle = battles[battleId];
        require(battleIsActive[battleId], "Battle is not active");
        require(
            battle.attacker == msg.sender || battle.defender == msg.sender,
            "You are not a participant in this battle"
        );

        battleIsActive[battleId] = false;
        emit BattleEnded(battleId, 0); // 0 indicates a draw
    }

    

    function getBattle(uint256 battleId)
        public
        view
        returns (
            uint256 attackerTokenId,
            uint256 defenderTokenId,
            uint256 attackerHp,
            uint256 defenderHp,
            uint256 attackerPower,
            uint256 defenderPower,
            string memory attackerElement,
            string memory defenderElement,
            address attacker,
            address defender
        )
    {
        Battle memory battle = battles[battleId];
        return (
            battle.attackerTokenId,
            battle.defenderTokenId,
            battle.attackerHp,
            battle.defenderHp,
            battle.attackerPower,
            battle.defenderPower,
            elementTypeToString(battle.attackerElement),
            elementTypeToString(battle.defenderElement),
            battle.attacker,
            battle.defender
        );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.example.com/pokemonbattle/";
    }

    function isElementStrongAgainst(
        ElementType attackerElement,
        ElementType defenderElement
    ) internal pure returns (bool) {
        return
            (attackerElement == ElementType.Fire &&
                defenderElement == ElementType.Grass) ||
            (attackerElement == ElementType.Water &&
                defenderElement == ElementType.Fire) ||
            (attackerElement == ElementType.Grass &&
                defenderElement == ElementType.Water) ||
            (attackerElement == ElementType.Electric &&
                defenderElement == ElementType.Water);
    }

    function isElementWeakAgainst(
        ElementType attackerElement,
        ElementType defenderElement
    ) internal pure returns (bool) {
        return
            (attackerElement == ElementType.Fire &&
                defenderElement == ElementType.Water) ||
            (attackerElement == ElementType.Water &&
                defenderElement == ElementType.Grass) ||
            (attackerElement == ElementType.Grass &&
                defenderElement == ElementType.Fire) ||
            (attackerElement == ElementType.Electric &&
                defenderElement == ElementType.Grass);
    }

    function elementTypeToString(ElementType element)
        internal
        pure
        returns (string memory)
    {
        if (element == ElementType.Fire) {
            return "Fire";
        } else if (element == ElementType.Water) {
            return "Water";
        } else if (element == ElementType.Grass) {
            return "Grass";
        } else if (element == ElementType.Electric) {
            return "Electric";
        } else {
            revert("Invalid ElementType");
        }
    }



// Function to get the item types in a player's inventory
function getPlayerItemTypes(address player) public view returns (uint256[] memory) {
    uint256[] memory itemTypes = new uint256[](playerItems[player].length);

    for (uint256 i = 0; i < playerItems[player].length; i++) {
        itemTypes[i] = uint256(playerItems[player][i].itemType);
    }
    return itemTypes;
}



function _useItem(uint256 battleId, ItemType itemType) internal {
    require(battleIsActive[battleId], "Battle is not active");
    require(
        currentTurn[battleId] == msg.sender,
        "It is not your turn to use an item"
    );

    Item[] storage items = battleItems[battleId][msg.sender];
    bool itemFound = false;
    uint256 effectValue;

    mapping(ItemType => uint256) storage usageCounter = itemUsageCounter[battleId][msg.sender];

    for (uint256 i = 0; i < items.length; i++) {
        if (items[i].itemType == itemType && !items[i].isActive) {
            require(usageCounter[itemType] < 5, "Item usage limit reached in this battle");
            itemFound = true;
            items[i].isActive = true;
            items[i].useCount++; // Add this line
            effectValue = items[i].effectValue;
            usageCounter[itemType]++;
            break;
        }
    }

    require(itemFound, "Item not found");

    Battle storage battle = battles[battleId];

    if (itemType == ItemType.Potion) {
        battle.attackerHp = battle.attackerHp.add(effectValue);
    } else if (itemType == ItemType.Shield) {
        battle.defenderPower = battle.defenderPower.sub(effectValue);
    } else if (itemType == ItemType.PowerUp) {
        battle.attackerPower = battle.attackerPower.add(effectValue);

    }

    for (uint256 i = 0; i < battleItems[battleId][msg.sender].length; i++) {
        if (battleItems[battleId][msg.sender][i].itemType == itemType) {
            battleItems[battleId][msg.sender][i] = battleItems[battleId][msg.sender][battleItems[battleId][msg.sender].length - 1];
            battleItems[battleId][msg.sender].pop();
            break;
        }
    }

    emit ItemUsed(battleId, itemType, msg.sender);
    _switchTurns(battleId);
}





function _itemCount(address player, ItemType itemType) internal view returns (uint256) {
    uint256 count = 0;
    for (uint256 i = 0; i < playerItems[player].length; i++) {
        if (playerItems[player][i].itemType == itemType) {
            count++;
        }
    }
    return count;
}

function buyShield() public {
    uint256 cost = 100; // Set cost for Shield
    uint256 effectValue = 20; // Set shield effect value
    uint256 useCount = 1; // Set use count for Shield
    require(!isInActiveBattle(msg.sender), "Cannot buy items during a battle");

    require(rewardToken.balanceOf(msg.sender) >= cost, "Not enough reward tokens");
    require(_itemCount(msg.sender, ItemType.Shield) < 3, "Cannot have more than 3 shields");

    rewardToken.transferFrom(msg.sender, address(this), cost);

    playerItems[msg.sender].push(Item({
        itemType: ItemType.Shield,
        effectValue: effectValue,
        isActive: false,
        useCount: useCount
    }));
}

function buyPotion() public {
    uint256 cost = 50; // Set cost for Potion
    uint256 effectValue = 50; // Set potion effect value
    uint256 useCount = 1; // Set use count for Potion
    require(!isInActiveBattle(msg.sender), "Cannot buy items during a battle");

    require(rewardToken.balanceOf(msg.sender) >= cost, "Not enough reward tokens");
    require(_itemCount(msg.sender, ItemType.Potion) < 3, "Cannot have more than 3 potions");

    rewardToken.transferFrom(msg.sender, address(this), cost);

    playerItems[msg.sender].push(Item({
        itemType: ItemType.Potion,
        effectValue: effectValue,
        isActive: false,
        useCount: useCount
    }));
}

function buyPowerUp() public {
    uint256 cost = 150; // Set cost for PowerUp
    uint256 effectValue = 30; // Set power-up effect value
    uint256 useCount = 1; // Set use count for PowerUp
    require(!isInActiveBattle(msg.sender), "Cannot buy items during a battle");

    require(rewardToken.balanceOf(msg.sender) >= cost, "Not enough reward tokens");
    require(_itemCount(msg.sender, ItemType.PowerUp) < 3, "Cannot have more than 3 power-ups");

    rewardToken.transferFrom(msg.sender, address(this), cost);

    playerItems[msg.sender].push(Item({
        itemType: ItemType.PowerUp,
        effectValue: effectValue,
        isActive: false,
        useCount: useCount
    }));
}


function getItemUsageCounter(uint256 battleId, address player, ItemType itemType) public view returns (uint256) {
    return itemUsageCounter[battleId][player][itemType];
}


}
