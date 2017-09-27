pragma solidity ^0.4.11;

contract Fight {
  //array of [player1choice][player2choice] to determine who wins
  mapping (string => mapping(string => uint)) whoWins;

  //amount of money each player has won.
  mapping(address => uint) public balances;

  //player addresses
  address public player1;
  address public player2;

  address public winningPlayer;

  bool public player1CheckedResult;
  bool public player2CheckedResult;

  //sha256 hashes of player choice + secret key
  bytes32 public player1Hash;
  bytes32 public player2Hash;

  //the raw string choice, only produced after both players submit
  string public player1Choice;
  string public player2Choice;

  //time of first person reveal
  uint public firstReveal;

  //how much the game costs to play (first person to enter sets it)
  uint public buyin;

  modifier isPlayer() {
    require(msg.sender == player1 || msg.sender == player2);
    _;
  }

  modifier isNotPlayer() {
    require(msg.sender != player1 && msg.sender != player2);
    _;
  }

  modifier enoughMoney(uint amount) {
    require(msg.value >= amount);
    _;
  }

  modifier validChoice(string choice) {
    bytes32 choiceHash = sha256(choice);
    require(choiceHash == sha256("rock") || choiceHash == sha256("paper") || choiceHash == sha256("scissors"));
    _;
  }

  modifier bothSubmitted() {
    require(player1Hash != 0 && player2Hash != 0);
    _;
  }

  function Fight() public {
    buyin = 0;
    player1CheckedResult = true;
    player2CheckedResult = true;

    whoWins["rock"]["rock"] = 0;
    whoWins["rock"]["paper"] = 2;
    whoWins["rock"]["scissors"] = 1;
    whoWins["paper"]["rock"] = 1;
    whoWins["paper"]["paper"] = 0;
    whoWins["paper"]["scissors"] = 2;
    whoWins["scissors"]["rock"] = 2;
    whoWins["scissors"]["paper"] = 1;
    whoWins["scissors"]["scissors"] = 0;
  }

  function register() public enoughMoney(buyin) isNotPlayer payable {
    if (player1CheckedResult && player2CheckedResult) {
      if (winningPlayer != 0) {
        player1Choice = "";
        player2Choice = "";
        winningPlayer = 0;
        player1Hash = 0;
        player2Hash = 0;
        firstReveal = 0;
      }

      if (player1 == 0) {
        player1 = msg.sender;
        buyin = msg.value;
      } else {
        require(msg.value >= buyin);
        if (player2 == 0) {
          player2 = msg.sender;
          if (msg.value > buyin) {
            balances[msg.sender] += msg.value - buyin;
          } else {
            balances[msg.sender] += msg.value;
          }
        } else {
          balances[msg.sender] += msg.value;
        }
      }
    } else {
      balances[msg.sender] += msg.value;
    }
  }

  function play(string choice, string key) public isPlayer validChoice(choice) {
    player1CheckedResult = false;
    player2CheckedResult = false;

    if (msg.sender == player1 && player1Hash == 0)
      player1Hash = sha256(sha256(choice) ^ sha256(key));
    else if (msg.sender == player2 && player2Hash == 0)
      player2Hash = sha256(sha256(choice) ^ sha256(key));
  }

  function reveal(string key) public bothSubmitted isPlayer {
    var choice = "";
    if (msg.sender == player1) {
      if (sha256(sha256("rock") ^ sha256(key)) == player1Hash) {
        choice = "rock";
      } else if (sha256(sha256("paper") ^ sha256(key)) == player1Hash) {
        choice = "paper";
      } else if (sha256(sha256("scissors") ^ sha256(key)) == player1Hash) {
        choice = "scissors";
      }
      player1Choice = choice;
      // second person is on timer after first person reveals
      if (bytes(player1Choice).length != 0 && bytes(player2Choice).length == 0)
        firstReveal = now;
    } else if (msg.sender == player2) {
      if (sha256(sha256("rock") ^ sha256(key)) == player2Hash) {
        choice = "rock";
      } else if (sha256(sha256("paper") ^ sha256(key)) == player2Hash) {
        choice = "paper";
      } else if (sha256(sha256("scissors") ^ sha256(key)) == player2Hash) {
        choice = "scissors";
      }
      player2Choice = choice;
      // second person is on timer after first person reveals
      if (bytes(player2Choice).length != 0 && bytes(player1Choice).length == 0)
        firstReveal = now;
    }
  }

  function checkWinner() public returns (uint){
    if (bytes(player1Choice).length != 0 && bytes(player2Choice).length != 0){
      // if both reveal, check who won
      uint winner = whoWins[player1Choice][player2Choice];
      if (winner == 1) {
        balances[player1] += buyin * 2;
        winningPlayer = player1;
      }
      else if (winner == 2) {
        balances[player2] += buyin * 2;
        winningPlayer = player2;
      } else {
        balances[player1] += buyin;
        balances[player2] += buyin;
        winningPlayer = 0x1;
      }

      // clear players
      buyin = 0;

      if (msg.sender == player1) {
        player1CheckedResult = true;
      } else if (msg.sender == player2) {
        player2CheckedResult = true;
      }

      if (player1CheckedResult && player2CheckedResult) {
        player1 = 0;
        player2 = 0;
      }

      return winner;
    } else if (now > firstReveal + 86400){
      // second person didn't reveal their answer
      if (bytes(player1Choice).length != 0) {
        balances[player1] += buyin * 2;
        winningPlayer = player1;
        player1CheckedResult = true;
        player2CheckedResult = true;
        player1 = 0;
        player2 = 0;
        return 1;
      } else if (bytes(player2Choice).length != 0) {
        balances[player2] += buyin * 2;
        winningPlayer = player2;
        player1CheckedResult = true;
        player2CheckedResult = true;
        player1 = 0;
        player2 = 0;
        return 2;
      }
    }
  }

  function withdraw() public returns (uint) {
    uint amount = balances[msg.sender];

    if (amount > 0) {
      balances[msg.sender] = 0;

      if (!msg.sender.send(amount)) {
        balances[msg.sender] = amount;
        return 0;
      }
    }
    return amount;
  }
}
