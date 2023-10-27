import { useQuery, gql, useMutation, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";

export const BookList = () => {
  const GET_BOOK = gql`
    query GetBook($id: Int!) {
      book(id: $id) {
        title
        id
        number
        author {
          id
          name
        }
      }
    }
  `;

  const GET_BOOKS = gql`
    query books($offset: Int, $limit: Int) {
      books(offset: $offset, limit: $limit) {
        title
        number
        author {
          id
          name
        }
        id
      }
    }
  `;

  const REMOVE_BOOK = gql`
    mutation RemoveBook($id: Int!) {
      removeBook(id: $id) {
        title
        author {
          id
          name
        }
        id
        number
      }
    }
  `;

  const UPDATE_BOOK = gql`
    mutation UpdateBook($id: Int!, $title: String, $author: Author) {
      updateBook(id: $id, title: $title, author: $author) {
        title
        author {
          id
          name
        }
        id
        number
      }
    }
  `;

  const ADD_BOOK = gql`
    mutation AddBook($title: String!, $author: Author!) {
      addBook(title: $title, author: $author) {
        title
        author {
          id
          name
        }
        id
        number
      }
    }
  `;

  const client = useApolloClient();

  const [isFetching, setIsFetching] = useState(false);
  const { loading, error, data, fetchMore } = useQuery(GET_BOOKS, {
    variables: { offset: 0, limit: 1 },
  });
  useEffect(() => {
    setBookList(data?.books);
  }, [data?.books]);

  const { data: dataBook } = useQuery(GET_BOOK, {
    variables: { id: 1 },
  });

  const [removeBook] = useMutation(REMOVE_BOOK);
  const [updateBook] = useMutation(UPDATE_BOOK);
  const [addBook] = useMutation(ADD_BOOK);

  const [BookList, setBookList] = useState(data?.books || []);
  const handleClick = (id: number) => {
    removeBook({
      variables: { id },
    });
    const newList = BookList.filter((book: any) => book.id !== id);
    setBookList(newList);
  };

  const handleAddBook = (title: string, author: string) => {
    addBook({
      variables: { title, author },
    });
    const newList = [...BookList, { title, author }];
    setBookList(newList);
  };

  const [inputValue, setInputValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [authorValue, setAuthorValue] = useState("");

  const [inputIsActive, setInputIsActive] = useState({
    currentBookId: 0,
    isActive: false,
  });

  const toggleInput = (id: number) => {
    setInputIsActive({
      currentBookId: id,
      isActive: true,
    });
  };

  // const handleCache = () => {
  //   const data = client.readQuery({
  //     query: GET_BOOK,
  //     variables: { id: 1 },
  //   });
  //   client.cache.modify({
  //     id: client.cache.identify(data?.book),
  //     fields: {
  //       title() {
  //         return "Lord of the ring";
  //       },
  //     },
  //   });
  // };

  // const handleCache = () => {
  //   client.writeQuery({
  //     query: GET_BOOKS,
  //     data: {
  //       books: {
  //         ...BookList,
  //         __typename: "Book",
  //         id: 1,
  //         title: "L'art de la guerre",
  //         author: "Sun tzu",
  //       },
  //     },
  //   });
  // };

  const handleCache = () => {
    client.cache.evict({ id: "Book:1" });

    const cache = {
      ...client.cache.extract(),
    };
    console.log("cache before GC", cache);
    client.cache.gc();
    const cacheSnapshotAfterGC = {
      ...client.cache.extract(),
    };
    console.log("cache after GC", cacheSnapshotAfterGC);
    const keysBeforeGC = Object.keys(cache);
    const keysAfterGC = Object.keys(cacheSnapshotAfterGC);

    const removedKeys = keysBeforeGC.filter(
      (key) => !keysAfterGC.includes(key)
    );
    console.log("Keys removed by GC:", removedKeys);
  };

  useEffect(() => {
    console.log("cache ========", client.cache.extract());
  }, []);
  console.log("BookList", BookList);
  return (
    <>
      <button onClick={handleCache}>CLEAN CACHE</button>
      {BookList?.length && (
        <>
          <button
            onClick={() => {
              fetchMore({
                variables: { offset: BookList.length, limit: 1 },
              })
                .then((response) => {
                  setIsFetching(true);
                  setBookList((prevState: any) => [
                    ...prevState,
                    response.data.books[0],
                  ]);
                })
                .catch((err) => {
                  console.log("error", err);
                })
                .finally(() => {
                  setIsFetching(false);
                });
            }}
          >
            GET MORE
          </button>
          <button
            onClick={() => {
              fetchMore({
                variables: { offset: 0, limit: BookList.length - 1 },
              })
                .then((response) => {
                  setIsFetching(true);
                  setBookList(response.data.books);
                })
                .catch((err) => {
                  console.log("error", err);
                })
                .finally(() => {
                  setIsFetching(false);
                });
            }}
          >
            GET LESS
          </button>
        </>
      )}

      <p>ajouter un livre: </p>
      <div>
        <form>
          <input
            value={titleValue}
            onChange={(event: any) => setTitleValue(event.target.value)}
          />
          <input
            value={authorValue}
            onChange={(event: any) => setAuthorValue(event.target.value)}
          />

          <button
            type="submit"
            onClick={(e: any) => {
              e.preventDefault();
              handleAddBook(titleValue, authorValue);
            }}
          >
            Ajouter un livre
          </button>
        </form>
      </div>
      <p>liste: </p>
      <div>
        {BookList &&
          BookList.length > 0 &&
          BookList.map(({ id, title, author }: any) => {
            return (
              <div key={id}>
                <h3 onClick={() => toggleInput(id)}>
                  {inputIsActive.isActive &&
                  id === inputIsActive.currentBookId ? (
                    <input
                      value={inputValue}
                      onChange={(event: any) =>
                        setInputValue(event.target.value)
                      }
                    />
                  ) : (
                    title
                  )}
                  <p
                    onClick={() => {
                      updateBook({
                        variables: { id, title: inputValue },
                      });
                      setInputIsActive({
                        ...inputIsActive,
                        isActive: false,
                      });
                    }}
                  >
                    Valider
                  </p>
                </h3>
                <br />
                <b>About this author:</b>
                <p>{author?.name}</p>
                <p onClick={() => handleClick(id)}>X</p>
                <br />
              </div>
            );
          })}
      </div>
      <p>Livre choisi</p>
      <div>
        <h3>{dataBook?.book.title}</h3>
        <br />
        <b>About this author:</b>
        <p>{dataBook?.book.author?.name}</p>
        <br />
      </div>
    </>
  );
};
