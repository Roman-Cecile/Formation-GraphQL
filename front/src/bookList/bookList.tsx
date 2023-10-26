import { useQuery, gql, useMutation, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export const BookList = () => {
  const FRAGMENT_DETAILS = gql`
    fragment BookInfo on Book {
      title
      author
      id
    }
  `;
  const GET_BOOKS = gql`
    query GetBook {
      books {
        title
        author
        id
      }
    }
  `;

  const GET_BOOK = gql`
    query GetBook($id: Int!) {
      book(id: $id) {
        ...${FRAGMENT_DETAILS}
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

  const GET_BOOK_WITH_FRAGMENT = gql`
    query books {
      books {
        ...BookInfo
      }
    }
    ${FRAGMENT_DETAILS}
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
  //   const { loading, error, data } = useQuery(GET_BOOKS);
  const { loading, error, data } = useQuery(GET_BOOK_WITH_FRAGMENT);
  useEffect(() => {
    setBookList(data?.books);
  }, [data]);
  const {
    loading: loadingBook,
    error: errorBook,
    data: dataBook,
  } = useQuery(GET_BOOK, {
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

  console.log("test ====", inputIsActive.isActive);

  return (
    <>
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
        {BookList?.map(({ id, title, author }: any) => (
          <div key={id}>
            <h3 onClick={() => toggleInput(id)}>
              {inputIsActive.isActive && id === inputIsActive.currentBookId ? (
                <input
                  value={inputValue}
                  onChange={(event: any) => setInputValue(event.target.value)}
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
        ))}
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
