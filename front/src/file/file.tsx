import React from "react";
import { gql, useMutation } from "@apollo/client";

export const File = () => {
  const UPLOAD_FILE = gql`
    mutation UploadFile($file: Upload!) {
      uploadFile(file: $file) {
        filename
        mimetype
        encoding
        url
      }
    }
  `;
  const [uploadFile] = useMutation(UPLOAD_FILE);
  return (
    <div>
      <h1>File</h1>
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          const fileToUpload = e.target.files?.[0];
          console.log("fileToUpload", fileToUpload);
          if (fileToUpload) {
            console.log("IN IF");
            uploadFile({
              variables: {
                file: fileToUpload,
              },
            })
              .then((res) => {
                alert("GG les BG");
              })
              .catch((err) => {
                console.log("ERROR ==============", err);
              });
          }
        }}
      />
    </div>
  );
};
