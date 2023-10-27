import { useQuery, gql, useMutation, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";

export const BookList = () => {
  const GET_BOOK = gql`
    query GetBook($id: Int!) {
      book(id: $id) {
        title
        author
        id
      }
    }
  `;

  const GET_BOOKS = gql`
    query books {
      books {
        title
        author
        id
      }
    }
  `;

  const REMOVE_BOOK = gql`
    mutation RemoveBook($id: Int!) {
      removeBook(id: $id) {
        title
        author
        id
      }
    }
  `;

  const UPDATE_BOOK = gql`
    mutation UpdateBook($id: Int!, $title: String, $author: String) {
      updateBook(id: $id, title: $title, author: $author) {
        title
        author
        id
      }
    }
  `;

  const ADD_BOOK = gql`
    mutation AddBook($title: String!, $author: String!) {
      addBook(title: $title, author: $author) {
        title
        author
        id
      }
    }
  `;

  const client = useApolloClient();

  const { loading, error, data } = useQuery(GET_BOOKS);
  useEffect(() => {
    setBookList(data?.books);
  }, [data]);
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

  const handleCache = async () => {
    const { books } = await client.readQuery({ query: GET_BOOKS });
    console.log("books ", books);
    const filteredBooks = books.filter((book: any) => book.id !== 2);
    console.log("filterted books ======", filteredBooks);
    client.writeQuery({
      query: GET_BOOKS,
      data: {
        books: filteredBooks,
      },
    });
  };

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

  return (
    <>
      <button onClick={handleCache}>UPDATE CACHE</button>
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
            const { books } = client.readQuery({ query: GET_BOOKS });
            console.log("books", books);
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
                      console.log("inputIsActive", inputIsActive);
                    }}
                  >
                    Valider
                  </p>
                </h3>
                <br />
                <b>About this author:</b>
                <p>{author}</p>
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
        <p>{dataBook?.book.author}</p>
        <br />
      </div>
    </>
  );
};
