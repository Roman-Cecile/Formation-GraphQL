import { gql, useSubscription } from "@apollo/client";

export const Chat = () => {
  const ADD_MESSAGE = gql`
    subscription OnMessageAdded {
      messageAdded {
        id
        content
      }
    }
  `;

  const { data, loading, error } = useSubscription(ADD_MESSAGE);
  console.log({ data });
  console.log({ loading });
  console.log({ error });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;
  return (
    <div>
      <h1>{data?.messageAdded.content}</h1>
      <p>{data?.length || 0}</p>
    </div>
  );
};
