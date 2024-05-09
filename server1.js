var express = require("express");
var { createHandler } = require("graphql-http/lib/use/express");
var graphql = require("graphql");
var { ruruHTML } = require("ruru/server");

// Maps id to User object
var fakeDatabase = {
  a: {
    id: "a",
    name: "alice",
  },
  b: {
    id: "b",
    name: "bob",
  },
};

const newFriendObj = new graphql.GraphQLObjectType({
  name: "newFriendObjType",
  fields: {
    friendName: {
      type: graphql.GraphQLString,
    },
  },
});

const myObjectTest = new graphql.GraphQLObjectType({
  name: "myObjectTestType",
  fields: {
    friend: {
      type: graphql.GraphQLString,
    },
    newFriend: {
      type: newFriendObj,
    },
  },
});

// Define the User type
var userType = new graphql.GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
    testFun: {
      type: graphql.GraphQLString,
      resolve(obj, args, context, info) {
        console.log("TestFun Resolve: ");
        console.log(obj);
        console.log(args);
        // console.log(context);
        return "Hey";
      },
    },
    testFriend: { type: myObjectTest },
  },
});

// Define the Query type
var queryType = new graphql.GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: userType,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      },
      resolve: (obj, args, context, info) => {
        console.log("Parent User Resolve: ");
        console.log(obj);
        console.log(args);
        const returnType = fakeDatabase[args.id];
        returnType.testFun = "Some"; // Resolve will override this!
        const newTestObejct = {
          friend: "Hello Friend",
          newFriend: {
            friendName: "Hello Tiger"
          },
        };
        returnType.testFriend = newTestObejct;
        // console.log(context);
        // console.log(info);
        return returnType;
      },
    },
  },
});

var schema = new graphql.GraphQLSchema({ query: queryType });

var app = express();
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    context: () => {
      return { Hey: "World" };
    },
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");
