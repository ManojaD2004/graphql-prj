var express = require("express");
var { createHandler } = require("graphql-http/lib/use/express");
var { buildSchema } = require("graphql");
var { ruruHTML } = require("ruru/server");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice(numDice: Int, numSides: Int): [Int]
    tryMyObject: [MyObject]
    tryMyList: [String]
    getDie(numSides: Int): RandomDie
    getRandNumber(testNo: TestNumber!): TestObject
  }
  input TestNumber {
    testNo1: Int
    testNo2: Int
  }
  type MyObject {
    someName: String
    someDay: String
  }
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }
  type TestObject {
    testNumber: Int
    testFun: [Int]
  }
`);

// This class implements the RandomDie GraphQL type
class RandomDie {
  constructor(numSides) {
    this.numSides = numSides
  }
  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides)
  }
 
  roll({ numRolls }) {
    var output = []
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce())
    }
    return output
  }
}

class TestObjectClass {
  constructor(testNo) {
    this.testNumber = testNo;
  }
  testFun() {
    const testList = [];
    for (let index = 0; index < this.testNumber; index++) {
      testList.push(1 + Math.floor(Math.random() * (10)));
    }
    return testList;
  }
}

// The root provides a resolver function for each API endpoint
var root = {
  quoteOfTheDay() {
    return Math.random() < 0.5 ? "Take it easy" : "Salvation lies within";
  },
  random() {
    return Math.random();
  },
  rollDice({ numDice, numSides }) {
    var output = [];
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  },
  tryMyObject() {
    return [{ someName: "Spider-Man", someDay: "Wednesday" }];
  },
  tryMyList() {
    return ["Hello", "World"];
  },
  getDie({ numSides }) {
    return new RandomDie(numSides || 6);
  },
  getRandNumber({testNo}) {
    console.log(testNo);
    return new TestObjectClass(testNo.testNo1);
  },
};

var app = express();

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
);

// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

// Start the server at port
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
