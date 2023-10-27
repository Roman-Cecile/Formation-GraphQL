import React, { useState, useEffect, useCallback, FC } from "react";
import "./App.css";
import { BookList } from "./bookList/bookList";
import { NormalizedCacheObject } from "@apollo/client";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

const App = (props: any): JSX.Element => {
  const { cache } = props;
  const [persistor, setPersistor] =
    useState<CachePersistor<NormalizedCacheObject>>();

  useEffect(() => {
    async function init() {
      let newPersistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        debug: true,
        trigger: "write", // Gourmand, autant utiliser "background" par défaut pour que ça se fasse tout seul
      });
      await newPersistor.restore();
      setPersistor(newPersistor as any);
    }

    init().catch(console.error);
  }, []);

  const clearCache = useCallback(() => {
    if (!persistor) {
      return;
    }
    persistor.purge();
  }, [persistor]);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="App">
      <button onClick={clearCache}>Clear Cache</button>
      <button onClick={reload}>Reload</button>
      <BookList />
    </div>
  );
};

export default App;
