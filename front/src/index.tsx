import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
const cache = new InMemoryCache({
  typePolicies: {
    Book: {
      keyFields: ["number"], // Cette version donne : Book:{"number":10}
    },
  },
});
// const cache = new InMemoryCache({
//   typePolicies: {
//     Book: {
//       keyFields: (obj) => {
//         return `Book:${obj.number}`; // Cette version donne : Book:10
//       },
//     },
//   },
// });
const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ApolloProvider client={client}>
    <App cache={cache} />
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
