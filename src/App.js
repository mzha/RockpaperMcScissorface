import React, { Component } from 'react'
import FightContract from '../build/contracts/Fight.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      playerInGame: null,
      price: 0.0,
      web3: null,
      contract: null,
      pageState: "loading",
      accounts: null,
      password: "",
      move: "rock",
      time: 0,
      winStatus: "tied",
      address: ""
    }

    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleMoveChange = this.handleMoveChange.bind(this);
    this.startGame = this.startGame.bind(this);
    this.submitMove = this.submitMove.bind(this);
    this.handleReveal = this.handleReveal.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const fight = contract(FightContract)
    fight.setProvider(this.state.web3.currentProvider)
    var appInstance = this;

    appInstance.state.web3.eth.getAccounts((error, accounts) => {
      fight.deployed().then((instance) => {
        appInstance.setState({
          contract: instance,
          accounts: accounts
        })

        appInstance.setState({
          address: accounts[0]
        })

        appInstance.state.contract.buyin().then(function(buyin) {
          appInstance.setState({
            price: buyin / 1000000000000000000
          })
        })

        appInstance.state.contract.player1().then(function(player1) {
          if (player1 != 0) {
            appInstance.state.contract.player2().then(function(player2) {
              if (player2 != 0) {
                if (player1 === appInstance.state.accounts[0]) {
                  appInstance.setState({
                    playerInGame: player2
                  })
                  appInstance.state.contract.player1Hash().then(function(hash) {
                    if (hash != 0) {
                      appInstance.state.contract.player2Hash().then(function(hash2) {
                        if (hash2 != 0) {
                          appInstance.state.contract.player1Choice().then(function(choice1) {
                            if (choice1.length != 0) {
                              appInstance.state.contract.player2Choice().then(function(choice2) {
                                if (choice2.length != 0) {
                                  appInstance.state.contract.player1CheckedResult().then(function(checked1) {
                                    if (checked1) {
                                      appInstance.state.contract.player2CheckedResult().then(function(checked2) {
                                        if (checked2) {
                                          appInstance.setState({
                                            pageState: "homeNoGame"
                                          })
                                        } else {
                                          appInstance.setState({
                                            pageState: "checkWinner"
                                          })
                                        }
                                      })
                                    } else {
                                      appInstance.setState({
                                        pageState: "checkWinner"
                                      })
                                    }
                                  })
                                } else {
                                  appInstance.setState({
                                    pageState: "waitingReveal"
                                  })
                                }
                              })
                            } else {
                              appInstance.state.contract.firstReveal().then(function(time) {
                                if (time != 0) {
                                  var d = new Date(time * 1000 + 86400000)
                                  appInstance.setState({
                                    time: d,
                                    pageState: "revealingMoveSecond"
                                  })
                                } else {
                                  appInstance.setState({
                                    pageState: "revealingMoveFirst"
                                  })
                                }
                              })
                            }
                          })
                        } else {
                          appInstance.setState({
                            pageState: "waitingGame"
                          })
                        }
                      })
                    } else {
                      appInstance.setState({
                        pageState: "playingGame"
                      })
                    }
                  })
                } else if (player2 === appInstance.state.accounts[0]) {
                  appInstance.setState({
                    playerInGame: player1
                  })
                  appInstance.state.contract.player2Hash().then(function(hash) {
                    if (hash != 0) {
                      appInstance.state.contract.player1Hash().then(function(hash2) {
                        if (hash2 != 0) {
                          appInstance.state.contract.player2Choice().then(function(choice1) {
                            if (choice1.length != 0) {
                              appInstance.state.contract.player1Choice().then(function(choice2) {
                                if (choice2.length != 0) {
                                  appInstance.state.contract.player1CheckedResult().then(function(checked1) {
                                    if (checked1) {
                                      appInstance.state.contract.player2CheckedResult().then(function(checked2) {
                                        if (checked2) {
                                          appInstance.setState({
                                            pageState: "homeNoGame"
                                          })
                                        } else {
                                          appInstance.setState({
                                            pageState: "checkWinner"
                                          })
                                        }
                                      })
                                    } else {
                                      appInstance.setState({
                                        pageState: "checkWinner"
                                      })
                                    }
                                  })
                                } else {
                                  appInstance.setState({
                                    pageState: "waitingReveal"
                                  })
                                }
                              })
                            } else {
                              appInstance.state.contract.firstReveal().then(function(time) {
                                if (time != 0) {
                                  var d = new Date(time * 1000 + 86400000)
                                  appInstance.setState({
                                    time: d,
                                    pageState: "revealingMoveSecond"
                                  })
                                } else {
                                  appInstance.setState({
                                    pageState: "revealingMoveFirst"
                                  })
                                }
                              })
                            }
                          })
                        } else {
                          appInstance.setState({
                            pageState: "waitingGame"
                          })
                        }
                      })
                    } else {
                      appInstance.setState({
                        pageState: "playingGame"
                      })
                    }
                  })
                } else {
                  appInstance.setState({
                    pageState: "gameFull"
                  })
                }
              } else {
                if (player1 === appInstance.state.accounts[0]) {
                  appInstance.setState({
                    pageState: "homeHostingGame"
                  });
                } else {
                  appInstance.setState({
                    playerInGame: player1,
                    pageState: "homeYesGame"
                  })
                }
              }
            });
          } else {
            appInstance.setState({
              pageState: "homeNoGame"
            })
          }
        })
      })
      // .then((result) => {
      //   // Get the value from the contract to prove it worked.
      //   return fightInstance.get.call(accounts[0])
      // }).then((result) => {
      //   // Update state with the result.
      //   return this.setState({ storageValue: result.c[0] })
      // })
    })
  }

  handlePriceChange(event) {
    this.setState({
      price: event.target.value
    });
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value
    })
  }

  handleMoveChange(event) {
    this.setState({
      move: event.target.value
    })
  }

  registerPlayer() {
    var app = this
    if (confirm("This will deduct " + this.state.price + " ETH from your account. Proceed?")) {
      setTimeout(function () {
        app.setState({
          pageState: "loading2"
        })
      }, 3000);
      this.state.contract.register({
        from: this.state.accounts[0],
        value: this.state.web3.toWei(this.state.price, 'ether')
      }).then(function(error) {
        app.setState({
          pageState: "playingGame"
        })
      })
    }
  }

  startGame(event) {
    var app = this
    if (confirm("This will deduct " + this.state.price + " ETH from your account (plus gas cost). Proceed?")) {
      setTimeout(function () {
        app.setState({
          pageState: "loading3"
        })
      }, 3000);
      this.state.contract.register({
        from: this.state.accounts[0],
        value: this.state.web3.toWei(this.state.price, 'ether')
      }).then(function(error) {
        app.setState({
          pageState: "homeHostingGame"
        })
      })
    }
  }

  submitMove(event) {
    var app = this
    if (confirm("You will not be able to undo this move. Proceed?")) {
      setTimeout(function () {
        app.setState({
          pageState: "loading4"
        })
      }, 3000);
      this.state.contract.play(this.state.move, this.state.password, {
        from: app.state.accounts[0]
      }).then(function(error) {
        app.setState({
          pageState: "waitingGame"
        })
      })
    }
  }

  handleReveal(event) {
    var app = this
    setTimeout(function () {
      app.setState({
        pageState: "loading2"
      })
    }, 3000);
    this.state.contract.reveal(this.state.password, {
      from: app.state.accounts[0]
    }).then(function(error) {
        app.setState({
          pageState: "waitingReveal"
        })
    })
  }

  checkWinner(event) {
    var app = this
    app.setState({
      pageState: "loading3"
    })
    app.state.contract.checkWinner({
      from: app.state.accounts[0]
    }).then(function(won) {
      app.state.contract.winningPlayer().then(function(player) {
        var winStat = ""
        switch(player) {
          case app.state.accounts[0]:
            winStat = "won"
            break;
          case app.state.playerInGame:
            winStat = "lost"
            break;
          default:
            winStat = "tied"
            break;
        }
        app.setState({
          pageState: "endAndWithdraw",
          winStatus: winStat
        })
      })
    })
  }

  withdraw() {
    var app = this
    app.setState({
      pageState: "loading4"
    })
    this.state.contract.withdraw({
      from: app.state.accounts[0]
    }).then(function(amount) {
      alert("You have successfully withdrawn your ether.");
      app.setState({
        pageState: "homeNoGame"
      })
    })
  }

  render() {
    switch(this.state.pageState){
      case "homeYesGame":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Welcome to Rockpaper McScissorface</h1>
                  <p>Play some rock paper scissors!</p>
                  <p>This game is hosted by {this.state.playerInGame}</p>
                  <p>Currently costs <span className="eth">{this.state.price} ETH</span> to play</p>
                  <button className="slide" onClick={(e) => this.registerPlayer(e)}> Play! </button>
                </div>
              </div>
            </main>
          </div>
        );
      case "homeNoGame":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Welcome to Rockpaper McScissorface</h1>
                  <p>Currently there is no game of rock-paper-scissors in progress. You can start one!</p>
                  <form className="pure-form" onSubmit={this.startGame}>
                    <label>
                      How much are you playing for? <span className="eth">(in ETH)</span>:
                      <br/>
                      <br/>
                      <input type="number" step="0.1" value={this.state.price} onChange={this.handlePriceChange}/>
                    </label>
                    <br/>
                    <br/>
                    <input className="slide" type="submit" value="Start a game!" />
                  </form>
                </div>
              </div>
            </main>
          </div>
        );
      case "homeHostingGame":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Game Lobby</h1>
                  <p>Currently hosting a game with a prize of <span className="eth">{this.state.price} ETH</span>.</p>
                  <p>Waiting for opponent...</p>
                </div>
              </div>
            </main>
          </div>
        );
      case "playingGame":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>In game against {this.state.playerInGame}</h1>
                  <p>Select a move and enter a password. </p>
                  <p><span className="warning">YOU WILL NEED THIS PASSWORD LATER TO REVEAL YOUR MOVE. WITHOUT IT, YOU FORFEIT.</span></p>
                  <form className="pure-form" onSubmit={this.submitMove}>
                    <label>
                      Choose a move:
                      <div className="row">
                        <div className="rock choice">
                          <input id="rock" type="radio" name="move" value="rock" checked={this.state.move === "rock"} onChange={this.handleMoveChange} />
                          <label className="rockLabel" htmlFor="rock"></label>
                        </div>
                        <div className="paper choice">
                          <input id="paper" type="radio" name="move" value="paper" checked={this.state.move === "paper"} onChange={this.handleMoveChange} />
                          <label className="paperLabel" htmlFor="paper"></label>
                        </div>
                        <div className="scissors choice">
                          <input id="scissors" type="radio" name="move" value="scissors" checked={this.state.move === "scissors"} onChange={this.handleMoveChange} />
                          <label className="scissorsLabel" htmlFor="scissors"></label>
                        </div>
                      </div>
                    </label>
                    <br/>
                    <br/>
                    <label>
                      Enter a password:
                      <input type="password" value={this.state.password} onChange={this.handlePasswordChange}/>
                    </label>
                    <br/>
                    <br/>
                    <input className="slide" type="submit" value="Submit Move" />
                  </form>
                </div>
              </div>
            </main>
          </div>
        );
      case "revealingMoveFirst":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>In game against {this.state.playerInGame}</h1>
                  <p>Both players have submitted! Reveal your move. Your opponent will have <span className="warning">24 hours</span> to reveal theirs or forfeit.</p>
                  <form className="pure-form" onSubmit={this.handleReveal}>
                    <label>
                      Enter the same password as before:
                      <input type="password" value={this.state.password} onChange={this.handlePasswordChange}/>
                    </label>
                    <br/>
                    <br/>
                    <input className="slide" type="submit" value="Reveal Move" />
                  </form>
                </div>
              </div>
            </main>
          </div>
        );
      case "revealingMoveSecond":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>In game against {this.state.playerInGame}</h1>
                  <p>Both players have submitted! Your opponent has already revealed their move. You have until <span className="warning">{this.state.time.toString()}</span>. Quickly reveal your own before the time limit!</p>
                  <form className="pure-form" onSubmit={this.handleReveal}>
                    <label>
                      Enter the same password as before:
                      <input type="password" value={this.state.password} onChange={this.handlePasswordChange}/>
                    </label>
                    <br/>
                    <br/>
                    <input className="slide" type="submit" value="Reveal Move" />
                  </form>
                </div>
              </div>
            </main>
          </div>
        );
      case "waitingReveal":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>In game against {this.state.playerInGame}</h1>
                  <p>Currently waiting for opponent to reveal their move. Refresh the page in a bit.</p>
                  <p>Waiting...</p>
                </div>
              </div>
            </main>
          </div>
        );
      case "endAndWithdraw":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Game Over</h1>
                  <p>You have <span className="big">{this.state.winStatus}</span> this game.</p>
                  <p>Click the 'Withdraw' button above to withdraw your ether.</p>
                </div>
              </div>
            </main>
          </div>
        );
      case "checkWinner":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Game has ended</h1>
                  <p>Click the button below to find out who won.</p>
                  <button onClick={(e) => this.checkWinner(e)}> See who won! </button>
                </div>
              </div>
            </main>
          </div>
        );
      case "waitingGame":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>In game against {this.state.playerInGame}</h1>
                  <p>Currently waiting for opponent to submit their move. Refresh the page in a bit.</p>
                  <p>Waiting...</p>
                </div>
              </div>
            </main>
          </div>
        );
      case "gameFull":
        return (
          <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <div className="pure-menu-heading address">Welcome, {this.state.address}</div>
                <button onClick={(e) => this.withdraw(e)}> Withdraw Funds </button>
            </nav>

            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>Game is full</h1>
                  <p>Two players have already engaged in battle. Come back in a while to see if they have finished.</p>
                </div>
              </div>
            </main>
          </div>
        );
      case "loading":
        return (
          <div className="App">
            <div className="loading">
              <h1> Loading... </h1>
              <div className="loadingGif"></div>
            </div>
          </div>
        );
      case "loading2":
        return (
          <div className="App">
            <div className="loading">
              <h1> Waiting for transaction... </h1>
              <div className="loadingGif2"></div>
            </div>
          </div>
        );
      case "loading3":
        return (
          <div className="App">
            <div className="loading">
              <h1> Waiting for transaction... </h1>
              <div className="loadingGif3"></div>
            </div>
          </div>
        );
      case "loading4":
        return (
          <div className="App">
            <div className="loading">
              <h1> Waiting for transaction... </h1>
              <div className="loadingGif4"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="App">
          </div>
        );
    }
  }
}

export default App
